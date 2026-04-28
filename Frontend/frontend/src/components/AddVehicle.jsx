import { useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";

function AddVehicle() {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const isCustomer = user.role !== "Mechanic";
  const [data, setData] = useState({
    ownerName: user.name || "",
    ownerPhone: user.phone || "",
    ownerEmail: user.email || "",
    regNumber: "",
    vehicleType: "",
    makeModel: "",
    fuelType: "",
    odometer: "",
    lastServiceDate: "",
    nextServiceDate: ""
  });

  const navigate = useNavigate();

  const update = (field, value) => setData((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post("http://localhost:5000/api/vehicles", data);
    alert("Vehicle profile added to digital health records");
    navigate("/vehicles");
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <Navbar />
        <section className="panel">
          <div className="section-header">
            <h3>Add Customer Vehicle</h3>
            <p>Create a permanent health profile for a car or bike.</p>
          </div>

          <form className="form-grid" onSubmit={handleSubmit}>
            <label>
              Owner Name
              <input value={data.ownerName} onChange={(e) => update("ownerName", e.target.value)} required readOnly={isCustomer} />
            </label>
            <label>
              Phone
              <input value={data.ownerPhone} onChange={(e) => update("ownerPhone", e.target.value)} required />
            </label>
            <label>
              Email
              <input type="email" value={data.ownerEmail} onChange={(e) => update("ownerEmail", e.target.value)} readOnly={isCustomer} />
            </label>
            <label>
              Registration Number
              <input value={data.regNumber} onChange={(e) => update("regNumber", e.target.value)} required />
            </label>
            <label>
              Vehicle Type
              <select value={data.vehicleType} onChange={(e) => update("vehicleType", e.target.value)} required>
                <option value="">Select</option>
                <option>Bike</option>
                <option>Scooter</option>
                <option>Car</option>
              </select>
            </label>
            <label>
              Make / Model
              <input value={data.makeModel} onChange={(e) => update("makeModel", e.target.value)} />
            </label>
            <label>
              Fuel Type
              <select value={data.fuelType} onChange={(e) => update("fuelType", e.target.value)}>
                <option value="">Select</option>
                <option>Petrol</option>
                <option>Diesel</option>
                <option>Electric</option>
                <option>Hybrid</option>
              </select>
            </label>
            <label>
              Odometer
              <input type="number" value={data.odometer} onChange={(e) => update("odometer", e.target.value)} />
            </label>
            <label>
              Last Service
              <input type="date" value={data.lastServiceDate} onChange={(e) => update("lastServiceDate", e.target.value)} />
            </label>
            <label>
              Next Service
              <input type="date" value={data.nextServiceDate} onChange={(e) => update("nextServiceDate", e.target.value)} />
            </label>
            <button className="primary-action" type="submit">
              Save Vehicle
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

export default AddVehicle;
