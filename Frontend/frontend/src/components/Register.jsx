import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const [data, setData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "Customer"
  });

  const navigate = useNavigate();

  const register = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/register", data);
      alert("Registration successful. Login with your new account.");
      navigate("/");
    } catch {
      alert("Error in registration");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Create AutoCare Account</h2>
        <p>Choose the correct role to get the right dashboard.</p>

        <form onSubmit={register}>
          <label>Name<input value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} required /></label>
          <label>Email<input type="email" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} required /></label>
          <label>Phone<input value={data.phone} onChange={(e) => setData({ ...data, phone: e.target.value })} /></label>
          <label>Password<input type="password" value={data.password} onChange={(e) => setData({ ...data, password: e.target.value })} required /></label>
          <label>
            Login Type
            <select value={data.role} onChange={(e) => setData({ ...data, role: e.target.value })}>
              <option>Customer</option>
              <option>Mechanic</option>
              <option>Admin</option>
            </select>
          </label>
          <button className="primary-action" type="submit">Register</button>
        </form>

        <p>
          Already registered? <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
