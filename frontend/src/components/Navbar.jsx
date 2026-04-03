import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../UserContext";

function Navbar() {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  };

  return (
    <div className="navbar">
      <div className="nav-left">
        <h3>Laundry App 🧺</h3>
      </div>

      <div className="nav-right">
        {user && (
          <>
            <span className="nav-user">
              👤 {user.username}
            </span>

            <span className={`nav-role ${user.role}`}>
              {user.role}
            </span>

            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Navbar;