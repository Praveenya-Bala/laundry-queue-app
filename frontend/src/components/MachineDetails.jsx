import { useParams } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { UserContext } from "../UserContext";
import { fetchWithAuth } from "../api";
import Navbar from "./Navbar";

function MachineDetails() {
  const { id } = useParams();
  const { user } = useContext(UserContext);

  const [queue, setQueue] = useState([]);
  const [machine, setMachine] = useState(null);
  const [loading, setLoading] = useState(true);

  /* Fetch machine + queue together */
  const fetchMachineAndQueue = async () => {
    try {
      const [machineRes, queueRes] = await Promise.all([
        fetchWithAuth(`/api/machines/${id}`),
        fetchWithAuth(`/api/queue/${id}`),
      ]);

      if (machineRes.status === 401 || queueRes.status === 401) {
        alert("Unauthorized! Please login again");
        return;
      }

      const machineData = await machineRes.json();
      const queueData = await queueRes.json();

      setMachine(machineData);
      setQueue(Array.isArray(queueData) ? queueData : []);
    } catch (err) {
      console.error("Error fetching machine or queue:", err);
      setMachine(null);
      setQueue([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachineAndQueue();
    const interval = setInterval(fetchMachineAndQueue, 3000);
    return () => clearInterval(interval);
  }, [id]);

  /* Queue actions */
  const handleJoinQueue = async () => {
    if (!user) return alert("Please login first");

    try {
      const res = await fetchWithAuth("/api/queue/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ machineId: id, userId: user._id }),
      });
      const data = await res.json();
      if (!res.ok) return alert(data.message);
      fetchMachineAndQueue();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLeaveQueue = async () => {
    try {
      await fetchWithAuth("/api/queue/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ machineId: id, userId: user._id }),
      });
      fetchMachineAndQueue();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartMachine = async () => {
    try {
      const res = await fetchWithAuth("/api/queue/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ machineId: id, userId: user._id }),
      });
      const data = await res.json();
      alert(data.message);
      fetchMachineAndQueue();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFinishMachine = async () => {
    try {
      const res = await fetchWithAuth("/api/queue/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ machineId: id, userId: user._id }),
      });
      const data = await res.json();
      alert(data.message);
      fetchMachineAndQueue();
    } catch (err) {
      console.error(err);
    }
  };

  /* User conditions */
  const isUserInQueue = user && queue.some(q => q?.user?._id === user._id);
  const isUserFirst = user && queue.length > 0 && queue[0]?.user?._id === user._id;
  const isUserNext = user && queue.length > 1 && queue[1]?.user?._id === user._id;

  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;

  return (
    <>
      <Navbar />
      <div className="machines-wrapper">
        <h2 className="machines-title">{machine?.name} Details</h2>
        <h3>Status: {machine?.status?.toUpperCase()}</h3>

        {/* QUEUE UI */}
        <div className="queue-card">
          <div className="queue-title">Queue Status</div>
          {queue.length === 0 ? (
            <p style={{ color: "#64748b", textAlign: "center" }}>
              No users in queue
            </p>
          ) : (
            <ul className="queue-list">
              {queue.map((q, i) => {
                const isYou = user && q?.user?._id === user._id;
                const isRunning = i === 0 && machine?.status === "running";
                const isFirstWaiting = i === 0 && machine?.status === "available";
                const isNext = i === 1;

                return (
                  <li
                    key={q._id}
                    className={`queue-item
                      ${isNext ? "queue-next" : ""}
                      ${isYou ? "queue-you" : ""}
                      ${isRunning ? "queue-current" : ""}
                    `}
                  >
                    <span className="queue-pos">#{i + 1}</span>
                    <span className="queue-name">{q?.user?.username || "Unknown"}</span>
                    <span>
                      {isRunning && <span className="queue-tag tag-current">Running</span>}
                      {isFirstWaiting && <span className="queue-tag tag-next">First</span>}
                      {isNext && <span className="queue-tag tag-next">Next</span>}
                      {isYou && <span className="queue-tag tag-you">You</span>}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* NOTIFICATIONS */}
        {isUserNext && machine?.status === "running" && (
          <p className="notify" style={{ color: "#856404", fontWeight: 600 }}>
            ⏳ You are next. Get ready!
          </p>
        )}
        {isUserFirst && machine?.status === "running" && (
          <p style={{ color: "red", fontWeight: 600 }}>
            🔒 Machine is running. Finish before leaving.
          </p>
        )}

        {/* BUTTONS */}
        <div style={{ marginTop: 20, display: "flex", gap: 10, justifyContent: "center" }}>
          {!isUserInQueue && <button className="join-btn" onClick={handleJoinQueue}>Join Queue</button>}
          {isUserInQueue && !isUserFirst && <button className="leave-btn" onClick={handleLeaveQueue}>Leave Queue</button>}
          {isUserFirst && machine?.status === "available" && (
            <>
              <button className="start-btn" onClick={handleStartMachine}>Start Machine</button>
              <button className="cancel-btn" onClick={handleLeaveQueue}>Cancel Turn</button>
            </>
          )}
          {isUserFirst && machine?.status === "running" && (
            <button className="finish-btn" onClick={handleFinishMachine}>Finish Machine</button>
          )}
        </div>
      </div>
    </>
  );
}

export default MachineDetails;