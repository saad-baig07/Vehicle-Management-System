import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

function EmergencySOS() {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState({
    customerName: user.name || "",
    phone: user.phone || "",
    vehicleRegNumber: "",
    issue: "",
    address: "",
    lat: "",
    lng: ""
  });

  const loadRequests = () => {
    axios.get("http://localhost:5000/api/sos").then((res) => setRequests(res.data));
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const createSos = async (e) => {
    e.preventDefault();
    await axios.post("http://localhost:5000/api/sos", {
      customerName: form.customerName,
      phone: form.phone,
      vehicleRegNumber: form.vehicleRegNumber,
      issue: form.issue,
      location: {
        address: form.address,
        lat: Number(form.lat || 0),
        lng: Number(form.lng || 0)
      }
    });
    setForm({
      customerName: user.name || "",
      phone: user.phone || "",
      vehicleRegNumber: "",
      issue: "",
      address: "",
      lat: "",
      lng: ""
    });
    loadRequests();
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <Navbar />
        <section className="section-header">
          <h3>Emergency Roadside Assistance</h3>
          <p>Panic-button workflow that captures location and dispatches the nearest available mechanic.</p>
        </section>

        <section className="panel sos-panel">
          <form className="form-grid" onSubmit={createSos}>
            <label>Name<input value={form.customerName} onChange={(e) => update("customerName", e.target.value)} required /></label>
            <label>Phone<input value={form.phone} onChange={(e) => update("phone", e.target.value)} required /></label>
            <label>Vehicle Number<input value={form.vehicleRegNumber} onChange={(e) => update("vehicleRegNumber", e.target.value)} required /></label>
            <label>Issue<input value={form.issue} onChange={(e) => update("issue", e.target.value)} required /></label>
            <label className="wide-field">Current Address<input value={form.address} onChange={(e) => update("address", e.target.value)} required /></label>
            <label>Latitude<input type="number" step="any" value={form.lat} onChange={(e) => update("lat", e.target.value)} /></label>
            <label>Longitude<input type="number" step="any" value={form.lng} onChange={(e) => update("lng", e.target.value)} /></label>
            <button className="panic-button" type="submit">Dispatch SOS</button>
          </form>
        </section>

        <div className="service-stack">
          {requests.map((request) => (
            <article className="service-card" key={request._id}>
              <div className="service-card-head">
                <div>
                  <h4>{request.vehicleRegNumber}</h4>
                  <span>{request.issue}</span>
                </div>
                <strong>{request.status}</strong>
              </div>
              <div className="service-details">
                <span>Customer: {request.customerName}</span>
                <span>Mechanic: {request.assignedMechanic?.name || "Waiting for availability"}</span>
                <span>Location: {request.location?.address}</span>
                <span>GPS: {request.location?.lat || 0}, {request.location?.lng || 0}</span>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}

export default EmergencySOS;
