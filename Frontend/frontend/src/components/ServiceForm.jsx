import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";

const serviceTypes = ["General Service", "Engine Issue", "Oil Change", "Puncture Repair", "Battery Check", "Brake Repair", "Other"];

function ServiceForm() {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const [vehicles, setVehicles] = useState([]);
  const [data, setData] = useState({
    vehicleId: "",
    customerName: user.name || "",
    customerPhone: user.phone || "",
    customerEmail: user.email || "",
    serviceType: "General Service",
    issueDescription: "",
    visitType: "Workshop",
    scheduledAt: "",
    address: "",
    nextServiceDate: ""
  });
  const navigate = useNavigate();

  useEffect(() => {
    const params = user.role === "Customer" ? { ownerEmail: user.email } : {};
    axios.get("http://localhost:5000/api/vehicles", { params }).then((res) => setVehicles(res.data));
  }, []);

  const update = (field, value) => setData((current) => ({ ...current, [field]: value }));

  const addService = async (e) => {
    e.preventDefault();
    await axios.post("http://localhost:5000/api/services", data);
    alert("Service booked. Admin can now assign a mechanic and send an itemized quote.");
    navigate("/tracking");
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <Navbar />
        <section className="panel">
          <div className="section-header">
            <h3>Anytime Service Booking</h3>
            <p>Schedule doorstep or workshop maintenance without phone calls or manual visits.</p>
          </div>

          <form className="form-grid" onSubmit={addService}>
            <label>
              Vehicle
              <select value={data.vehicleId} onChange={(e) => update("vehicleId", e.target.value)} required>
                <option value="">Select Vehicle</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle._id} value={vehicle._id}>
                    {vehicle.regNumber} - {vehicle.ownerName}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Customer Name
              <input value={data.customerName} onChange={(e) => update("customerName", e.target.value)} required readOnly={user.role === "Customer"} />
            </label>
            <label>
              Phone
              <input value={data.customerPhone} onChange={(e) => update("customerPhone", e.target.value)} required />
            </label>
            <label>
              Email
              <input type="email" value={data.customerEmail} onChange={(e) => update("customerEmail", e.target.value)} required readOnly={user.role === "Customer"} />
            </label>
            <label>
              Service Type
              <select value={data.serviceType} onChange={(e) => update("serviceType", e.target.value)}>
                {serviceTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </label>
            <label>
              Visit Type
              <select value={data.visitType} onChange={(e) => update("visitType", e.target.value)}>
                <option>Workshop</option>
                <option>Doorstep</option>
              </select>
            </label>
            <label className="wide-field">
              Issue Description
              <input
                placeholder="Example: engine issue, noise, overheating"
                value={data.issueDescription}
                onChange={(e) => update("issueDescription", e.target.value)}
                required
              />
            </label>
            <label>
              Date & Time
              <input type="datetime-local" value={data.scheduledAt} onChange={(e) => update("scheduledAt", e.target.value)} required />
            </label>
            <label className="wide-field">
              Doorstep / Workshop Address
              <input value={data.address} onChange={(e) => update("address", e.target.value)} required />
            </label>
            <label>
              Next Service Reminder
              <input type="date" value={data.nextServiceDate} onChange={(e) => update("nextServiceDate", e.target.value)} />
            </label>
            <button className="primary-action" type="submit">
              Book Service
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

export default ServiceForm;
