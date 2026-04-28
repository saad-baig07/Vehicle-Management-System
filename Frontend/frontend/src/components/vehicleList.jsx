import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { Link } from "react-router-dom";

function Vehicles() {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const isCustomer = user.role !== "Mechanic";
  const [vehicles, setVehicles] = useState([]);
  const [services, setServices] = useState([]);

  useEffect(() => {
    const params = isCustomer ? { ownerEmail: user.email } : {};
    const serviceParams = isCustomer ? { customerEmail: user.email } : {};
    axios.get("http://localhost:5000/api/vehicles", { params }).then((res) => setVehicles(res.data));
    axios.get("http://localhost:5000/api/services", { params: serviceParams }).then((res) => setServices(res.data));
  }, []);

  const historyFor = (vehicleId) => services.filter((service) => service.vehicleId?._id === vehicleId);

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <Navbar />
        <div className="section-row">
          <div className="section-header">
            <h3>Digital Vehicle Health Records</h3>
            <p>Centralized logbook for service history, parts replaced, and invoices.</p>
          </div>
          <Link to="/add-vehicle" className="primary-link">
            Add Vehicle
          </Link>
        </div>

        <div className="record-grid">
          {vehicles.map((vehicle) => {
            const history = historyFor(vehicle._id);
            const latest = history[0];
            return (
              <article className="record-card" key={vehicle._id}>
                <div>
                  <h4>{vehicle.regNumber}</h4>
                  <span>{vehicle.makeModel || vehicle.vehicleType}</span>
                </div>
                <dl>
                  <dt>Owner</dt>
                  <dd>{vehicle.ownerName}</dd>
                  <dt>Odometer</dt>
                  <dd>{vehicle.odometer || 0} km</dd>
                  <dt>Services</dt>
                  <dd>{history.length}</dd>
                  <dt>Latest Status</dt>
                  <dd>{latest?.status || "No service yet"}</dd>
                  <dt>Parts Replaced</dt>
                  <dd>{latest?.partsReplaced?.join(", ") || "None recorded"}</dd>
                </dl>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default Vehicles;
