import { useEffect, useState } from "react";
import { fetchWithAuth } from "../api";
import Navbar from "./Navbar";

const Admin = () => {
  const [machines, setMachines] = useState([]);
  const [name, setName] = useState("");

  /* Fetch machines */
  const fetchMachines = async () => {
    const res = await fetchWithAuth("/queue");
    const data = await res.json();
    setMachines(data);
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  /* Add machine */
  const handleAdd = async () => {
    if (!name.trim()) return;

    await fetchWithAuth("/machines/add", {
      method: "POST",
      body: JSON.stringify({ name }),
    });

    setName("");
    fetchMachines();
  };

  /* Remove machine */
  const handleRemove = async (id) => {
    await fetchWithAuth(`/machines/${id}`, {
      method: "DELETE",
    });

    fetchMachines();
  };

  /* Maintenance */
  const setMaintenance = async (id) => {
    const res = await fetchWithAuth(`/machines/${id}/maintenance`, {
      method: "PUT",
    });

    const data = await res.json();
    alert(data.message);

    fetchMachines();
  };

  /* Enable */
  const enableMachine = async (id) => {
    await fetchWithAuth(`/machines/${id}/enable`, {
      method: "PUT",
    });

    fetchMachines();
  };

  return (
    <>
      <Navbar />
      <div className="admin-container">
        <h2 className="admin-title">Admin Dashboard 🤵</h2>
        <hr /><br />

        {/* ADD MACHINE */}
        <div className="admin-add">
          <input
            className="admin-input"
            type="text"
            placeholder="Enter machine name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <button className="admin-add-btn" onClick={handleAdd}>
            Add Machine
          </button>
        </div>

        {/* MACHINE TABLE */}
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Current User</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {machines.map((m) => (
              <tr key={m._id}>
                <td>{m.name}</td>

                <td>
                  <span className={`status-${m.status}`}>
                    {m.status}
                  </span>
                </td>

                <td>
                  {m.currentUser ? m.currentUser.username : "—"}
                </td>

                <td className="action-group">
                  {m.status !== "maintenance" ? (
                    <button
                      className="btn btn-maintenance"
                      onClick={() => setMaintenance(m._id)}
                    >
                      Maintenance
                    </button>
                  ) : (
                    <button
                      className="btn btn-enable"
                      onClick={() => enableMachine(m._id)}
                    >
                      Enable
                    </button>
                  )}

                  <button
                    className="btn btn-remove"
                    onClick={() => handleRemove(m._id)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <h3>Machine Queues 📋</h3>

        {machines.map((m) => (
          <div key={m._id} className="queue-box">
            <h4>{m.name}</h4>

            {m.queue && m.queue.length > 0 ? (
              <ul>
                {m.queue.map((user, index) => (
                  <li key={index}>{user.username}</li>
                ))}
              </ul>
            ) : (
              <p>No users in queue</p>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default Admin;