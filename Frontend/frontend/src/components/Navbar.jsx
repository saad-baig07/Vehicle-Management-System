import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="topbar">
      <div>
        <h2>Unified AutoCare Platform</h2>
        <span>Booking, approval, dispatch, tracking, and digital health records</span>
      </div>

      <div className="topbar-actions">
        <span>{user?.name || "User"}</span>
        <button type="button" className="btn-muted" onClick={toggleTheme}>
          Theme
        </button>
        <button
          type="button"
          className="btn-danger"
          onClick={() => {
            localStorage.clear();
            navigate("/");
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;
