import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../UserContext";
import { fetchWithAuth } from "../api";
import Navbar from "./Navbar";

function Machines() {
  const { user } = useContext(UserContext);
  const [machines, setMachines] = useState([]);
  const [userStatus, setUserStatus] = useState(null);
  const navigate = useNavigate();

  /* Fetch machines from backend */
  const fetchMachines = async () => {
    try {
      const res = await fetchWithAuth("/api/machines"); // ✅ Fixed endpoint

      if (res.status === 401) {
        alert("Unauthorized! Please login again");
        setMachines([]);
        return;
      }

      const data = await res.json();

      if (Array.isArray(data)) {
        setMachines(data);
        findUserStatus(data);
      } else {
        setMachines([]);
        console.error("Machines API did not return an array");
      }
    } catch (err) {
      console.error("Error fetching machines:", err);
      setMachines([]);
    }
  };

  /* Determine user status on machines */
  const findUserStatus = async (machinesList) => {
    if (!user || !Array.isArray(machinesList)) return;

    // Check if user is currently running a machine
    const running = machinesList.find(
      (m) => m.currentUser?._id === user._id
    );

    if (running) {
      setUserStatus({ type: "running", machine: running });
      return;
    }

    // Check if user is in queue for any machine
    for (let m of machinesList) {
      try {
        const res = await fetchWithAuth(`/api/queue/${m._id}`);
        const queue = await res.json();

        if (!Array.isArray(queue)) continue;

        const position = queue.findIndex(
          (q) => q?.user?._id === user._id
        );

        if (position !== -1) {
          setUserStatus({
            type: "queue",
            machine: m,
            position: position + 1,
          });
          return;
        }
      } catch (err) {
        console.error(`Error fetching queue for machine ${m._id}:`, err);
      }
    }

    // User not in any queue or running machine
    setUserStatus({ type: "none" });
  };

  useEffect(() => {
    fetchMachines();
  }, [user]);

  return (
    <>
      <Navbar />
      <div className="machines-wrapper">
        <h2 className="machines-title">Select a Machine</h2>

        {/* USER STATUS */}
        {user && userStatus && (
          <div className="user-machine-info">
            {userStatus.type === "running" && (
              <p>
                🟢 You are using: <strong>{userStatus.machine?.name}</strong>
              </p>
            )}

            {userStatus.type === "queue" && (
              <p>
                ⏳ You are in queue for <strong>{userStatus.machine?.name}</strong> 
                (Position {userStatus.position})
              </p>
            )}

            {userStatus.type === "none" && (
              <p>✅ You are not in any queue or machine</p>
            )}
          </div>
        )}

        {/* MACHINES GRID */}
        <div className="machine-grid">
          {Array.isArray(machines) && machines.length > 0 ? (
            machines.map((m) => (
              <div
                key={m._id}
                className={`machine-card 
                  ${userStatus?.machine?._id === m._id ? "my-machine" : ""} 
                  ${m.status === "maintenance" ? "disabled" : ""}`}
                onClick={() => {
                  if (m.status === "maintenance") {
                    alert("Machine is under maintenance");
                    return;
                  }
                  navigate(`/machine/${m._id}`);
                }}
              >
                <h3>{m.name}</h3>
                <p className={`status ${m.status}`}>
                  {m.status === "available" && "Available"}
                  {m.status === "running" && "Running"}
                  {m.status === "maintenance" && "Maintenance"}
                </p>
              </div>
            ))
          ) : (
            <p>No machines available at the moment.</p>
          )}
        </div>
      </div>
    </>
  );
}

export default Machines;