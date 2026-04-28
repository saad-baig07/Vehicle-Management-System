import axios from "axios";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const homeForRole = (role) => {
  if (role === "Mechanic") return "/mechanic/jobs";
  return "/customer";
};

function Login() {
  const [data, setData] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const login = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", data);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate(homeForRole(res.data.user.role));
    } catch {
      alert("Login failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>AutoCare Login</h2>
        <p>Use your customer, mechanic, or admin account.</p>

        <form onSubmit={login}>
          <input
            type="email"
            placeholder="Email"
            value={data.email}
            onChange={(e) => setData({ ...data, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={data.password}
            onChange={(e) => setData({ ...data, password: e.target.value })}
            required
          />
          <button className="primary-action" type="submit">Login</button>
        </form>

        <p>
          New user? <Link to="/register">Create account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
