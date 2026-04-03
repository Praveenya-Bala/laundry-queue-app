import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api";
import { UserContext } from "../UserContext";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const resetForm = () => {
    setUsername("");
    setPassword("");
    setRole("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!role) {
      alert("Please select a role");
      return;
    }

    try {
      const res = await loginUser({ username, password });
      const data = await res.json();

      // ❌ Error from backend
      if (!res.ok) {
        alert(data.message);

        if (data.message === "User not found") {
          navigate("/signup");
        }

        resetForm();
        return;
      }

      // 🔒 ROLE CHECK
      if (role === "admin" && data.user.role !== "admin") {
        alert("Access denied: Not an admin");
        resetForm();
        return;
      }

      if (role === "user" && data.user.role !== "user") {
        alert("Please login as admin");
        resetForm();
        return;
      }

      // ✅ SAVE AUTH
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);

      setUser(data.user);

      // 🚀 REDIRECT
      if (data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/machines");
      }

      resetForm();

    } catch (err) {
      console.error("Login failed:", err);
      alert("Something went wrong");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Login</h2>

        <form onSubmit={handleLogin}>
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label>
            Choose a Role:
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="" disabled>
                Select Role
              </option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </label>

          <button type="submit">Login</button>
        </form>

        <p>
          New user?{" "}
          <span onClick={() => navigate("/signup")}>
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;