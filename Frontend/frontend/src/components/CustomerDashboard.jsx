import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const API = "http://localhost:5000/api";

function CustomerDashboard() {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [services, setServices] = useState([]);
  const [sosRequests, setSosRequests] = useState([]);
  const [message, setMessage] = useState("");

  const loadCustomerData = async () => {
    const [vehicleRes, serviceRes, sosRes] = await Promise.all([
      axios.get(`${API}/vehicles`, { params: { ownerEmail: user.email } }),
      axios.get(`${API}/services`, { params: { customerEmail: user.email } }),
      axios.get(`${API}/sos`)
    ]);

    setVehicles(vehicleRes.data);
    setServices(serviceRes.data);
    setSosRequests(
      sosRes.data.filter(
        (request) => request.customerName === user.name || request.phone === user.phone
      )
    );
  };

  useEffect(() => {
    loadCustomerData().catch(() => setMessage("Could not load customer dashboard data"));
  }, []);

  const stats = useMemo(() => {
    const activeServices = services.filter(
      (service) => !["Completed", "Cancelled", "Rejected"].includes(service.status)
    );
    const pendingQuotes = services.filter((service) => service.quoteStatus === "Sent");
    const nextService = vehicles
      .filter((vehicle) => vehicle.nextServiceDate)
      .sort((a, b) => new Date(a.nextServiceDate) - new Date(b.nextServiceDate))[0];

    return {
      vehicles: vehicles.length,
      activeServices: activeServices.length,
      pendingQuotes: pendingQuotes.length,
      sos: sosRequests.filter((request) => ["Open", "Dispatched"].includes(request.status)).length,
      nextServiceDate: nextService?.nextServiceDate
        ? new Date(nextService.nextServiceDate).toLocaleDateString()
        : "Not set"
    };
  }, [vehicles, services, sosRequests]);

  const quickActions = [
    {
      title: "Add Vehicle",
      text: "Create your vehicle health record first.",
      path: "/add-vehicle"
    },
    {
      title: "Book Service",
      text: "Schedule workshop or doorstep maintenance.",
      path: "/service",
      disabled: vehicles.length === 0
    },
    {
      title: "Track Booking",
      text: "Approve quotes and follow repair status.",
      path: "/tracking"
    },
    {
      title: "Emergency SOS",
      text: "Dispatch roadside help to your location.",
      path: "/sos"
    }
  ];

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <Navbar />

        <section className="customer-hero">
          <div>
            <span className="eyebrow">Customer Portal</span>
            <h1>Everything for your vehicle, visible in one place.</h1>
            <p>
              Add vehicles, book service, approve itemized quotes, track mechanic updates,
              view health records, and request SOS assistance.
            </p>
          </div>
          <div className="hero-actions">
            <Link className="primary-link" to="/add-vehicle">Add Vehicle</Link>
            <Link className="btn-muted" to={vehicles.length ? "/service" : "/add-vehicle"}>
              {vehicles.length ? "Book Service" : "Add Vehicle First"}
            </Link>
          </div>
        </section>

        {message && <div className="notice">{message}</div>}

        <div className="metric-grid">
          <button className="metric-card" onClick={() => navigate("/vehicles")}>
            <span>My Vehicles</span>
            <strong>{stats.vehicles}</strong>
            <small>Digital vehicle health records</small>
          </button>
          <button className="metric-card" onClick={() => navigate("/tracking")}>
            <span>Active Services</span>
            <strong>{stats.activeServices}</strong>
            <small>Bookings currently in progress</small>
          </button>
          <button className="metric-card" onClick={() => navigate("/tracking")}>
            <span>Quotes To Approve</span>
            <strong>{stats.pendingQuotes}</strong>
            <small>Approve or reject before repair starts</small>
          </button>
          <button className="metric-card" onClick={() => navigate("/sos")}>
            <span>Open SOS</span>
            <strong>{stats.sos}</strong>
            <small>Roadside requests still active</small>
          </button>
        </div>

        <section className="panel customer-actions">
          <div className="section-header compact-header">
            <h3>What do you want to do?</h3>
            <p>These are the customer functions available in this system.</p>
          </div>
          <div className="action-card-grid">
            {quickActions.map((action) => (
              <button
                type="button"
                key={action.title}
                className="action-card"
                onClick={() => navigate(action.disabled ? "/add-vehicle" : action.path)}
              >
                <strong>{action.title}</strong>
                <span>{action.disabled ? "Add a vehicle before booking service." : action.text}</span>
              </button>
            ))}
          </div>
        </section>

        <div className="dashboard-columns">
          <section className="panel">
            <div className="section-row">
              <div className="section-header compact-header">
                <h3>My Vehicles</h3>
                <p>Next service: {stats.nextServiceDate}</p>
              </div>
              <Link className="primary-link" to="/vehicles">View Records</Link>
            </div>

            <div className="mini-list">
              {vehicles.length === 0 && (
                <div className="empty-state">
                  No vehicle is added yet. Add one to unlock service booking.
                </div>
              )}
              {vehicles.slice(0, 3).map((vehicle) => (
                <article key={vehicle._id} className="mini-row">
                  <div>
                    <strong>{vehicle.regNumber}</strong>
                    <span>{vehicle.makeModel || vehicle.vehicleType || "Vehicle"}</span>
                  </div>
                  <button type="button" className="btn-muted" onClick={() => navigate("/service")}>
                    Book Service
                  </button>
                </article>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="section-row">
              <div className="section-header compact-header">
                <h3>Recent Bookings</h3>
                <p>Quotes, status updates, invoices, and parts.</p>
              </div>
              <Link className="primary-link" to="/tracking">Track All</Link>
            </div>

            <div className="mini-list">
              {services.length === 0 && (
                <div className="empty-state">
                  No booking yet. Book a service after adding your vehicle.
                </div>
              )}
              {services.slice(0, 4).map((service) => (
                <article key={service._id} className="mini-row">
                  <div>
                    <strong>{service.serviceType}</strong>
                    <span>
                      {service.vehicleId?.regNumber || "Vehicle"} - {service.status} - Quote {service.quoteStatus}
                    </span>
                  </div>
                  {service.quoteStatus === "Sent" ? (
                    <button type="button" className="primary-action" onClick={() => navigate("/tracking")}>
                      Approve Quote
                    </button>
                  ) : (
                    <button type="button" className="btn-muted" onClick={() => navigate("/tracking")}>
                      View
                    </button>
                  )}
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default CustomerDashboard;
