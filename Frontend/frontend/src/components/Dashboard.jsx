import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [data, setData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/dashboard")
      .then((res) => setData(res.data))
      .catch((err) => console.log(err));
  }, []);

  const cards = [
    ["Vehicles", data.totalVehicles || 0, "Registered cars and bikes", "/vehicles"],
    ["Active Services", data.activeServices || 0, "Bookings in progress", "/tracking"],
    ["Pending Quotes", data.pendingQuotes || 0, "Awaiting customer approval", "/tracking"],
    ["Available Mechanics", data.availableMechanics || 0, "Ready for dispatch", "/mechanics"],
    ["Emergency SOS", data.openSos || 0, "Open roadside cases", "/sos"],
    ["Revenue", `Rs ${data.revenue || 0}`, "Paid invoices", "/tracking"]
  ];

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <Navbar />

        <section className="section-header">
          <h3>Admin Command Center</h3>
          <p>Smart dispatch, service visibility, transparent pricing, and workshop throughput at a glance.</p>
        </section>

        <div className="metric-grid">
          {cards.map(([title, value, caption, path]) => (
            <button key={title} className="metric-card" onClick={() => navigate(path)}>
              <span>{title}</span>
              <strong>{value}</strong>
              <small>{caption}</small>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
