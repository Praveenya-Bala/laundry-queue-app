import { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "../UserContext";

function Navbar() {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    navigate("/"); // go to home/login page
  };

  // Show back button only if not on home page
  const showBackButton = location.pathname !== "/";

  return (
    <div className="navbar">
      <div className="nav-left">
        {showBackButton && (
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← 
          </button>
        )}
        </div>
        <h3>Laundry App 🧺</h3>
      

      <div className="nav-right">
        {user && (
          <>
            <span className="nav-user">👤 {user.username}</span>
            <span className={`nav-role ${user.role}`}>{user.role}</span>
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