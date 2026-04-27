import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";

function AddRental() {
  const [vehicles, setVehicles] = useState([]);
  const [data, setData] = useState({
    vehicleId: ""
  });

  useEffect(() => {
    axios.get("http://localhost:5000/api/vehicles")
      .then(res => setVehicles(res.data));
  }, []);

  const startRental = async (e) => {
    e.preventDefault();
    await axios.post("http://localhost:5000/api/rentals/start", data);
    alert("Rental Started 🚀");
  };

  return (
    <div className="d-flex">
      <Sidebar />

      <div className="container mt-4">
        <div className="card p-4 shadow">

          <h3 className="mb-3 text-center">💰 Start Rental</h3>

          <form onSubmit={startRental}>

            <div className="mb-3">
              <label>Select Vehicle</label>
              <select className="form-control"
                onChange={e => setData({ vehicleId: e.target.value })}
                required
              >
                <option value="">Select Vehicle</option>
                {vehicles.map(v => (
                  <option key={v._id} value={v._id}>
                    {v.regNumber} - ₹{v.rentPerHour}/hr
                  </option>
                ))}
              </select>
            </div>

            <button className="btn btn-success w-100">
              Start Rental
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}

export default AddRental;