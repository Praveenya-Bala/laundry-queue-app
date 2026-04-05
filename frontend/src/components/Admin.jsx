import { useEffect, useState } from "react";
import { fetchWithAuth } from "../api";
import Navbar from "./Navbar";

const Admin = () => {
  const [machines, setMachines] = useState([]);
  const [name, setName] = useState("");

  // Fetch all machines
  const fetchMachines = async () => {
    try {
      const res = await fetchWithAuth("/api/machines"); // Correct API path
      if (!res.ok) throw new Error("Failed to fetch machines");

      const data = await res.json();
      setMachines(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching machines:", err);
      setMachines([]);
    }
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  // Add a new machine
  const handleAdd = async () => {
    if (!name.trim()) return;

    try {
      const res = await fetchWithAuth("/api/machines/add", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add machine");

      setMachines((prev) => [...prev, data]);
      setName("");
    } catch (err) {
      alert(err.message);
    }
  };

  // Remove machine
  const handleRemove = async (id) => {
    if (!window.confirm("Are you sure you want to remove this machine?")) return;

    try {
      const res = await fetchWithAuth(`/api/machines/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to remove machine");

      setMachines((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  // Set maintenance
  const setMaintenance = async (id) => {
    try {
      const res = await fetchWithAuth(`/api/machines/${id}/maintenance`, { method: "PUT" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to set maintenance");

      setMachines((prev) =>
        prev.map((m) => (m._id === id ? { ...m, status: "maintenance" } : m))
      );
      alert(data.message);
    } catch (err) {
      alert(err.message);
    }
  };

  // Enable machine
  const enableMachine = async (id) => {
    try {
      const res = await fetchWithAuth(`/api/machines/${id}/enable`, { method: "PUT" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to enable machine");

      setMachines((prev) =>
        prev.map((m) => (m._id === id ? { ...m, status: "available" } : m))
      );
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <>
      <Navbar />
      <div className="admin-container">
        <h2 className="admin-title">Admin Dashboard 🤵</h2>
        <hr />
        <br />

        {/* Add Machine */}
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

        {/* Machine Table */}
        <div className="table-wrapper" style={{ overflowX: "auto" }}>
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
                    <span className={`status-${m.status}`}>{m.status}</span>
                  </td>
                  <td>{m.currentUser ? m.currentUser.username : "—"}</td>
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
                    <button className="btn btn-remove" onClick={() => handleRemove(m._id)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Machine Queues */}
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