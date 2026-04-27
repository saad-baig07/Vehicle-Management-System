import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";

function Rentals() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/rentals")
      .then(res => setData(res.data));
  }, []);

  return (
    <div className="d-flex">
      <Sidebar />

      <div className="container mt-4">
        <h3>💰 Rentals</h3>

        <table className="table table-striped mt-3">
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Start</th>
              <th>End</th>
              <th>Total ₹</th>
            </tr>
          </thead>

          <tbody>
            {data.map(r => (
              <tr key={r._id}>
                <td>{r.vehicleId?.regNumber}</td>
                <td>{new Date(r.startTime).toLocaleString()}</td>
                <td>{r.endTime ? new Date(r.endTime).toLocaleString() : "Running"}</td>
                <td>{r.totalCost || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </div>
  );
}

export default Rentals;