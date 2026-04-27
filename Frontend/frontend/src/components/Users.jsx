import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";

function Users() {
  const [data, setData] = useState([]);

  useEffect(() => {
  axios.get("http://localhost:5000/api/auth/users")
    .then(res => {
      console.log("API DATA:", res.data); // ✅ ADD HERE
      setData(res.data);
    })
    .catch(err => console.log(err));
}, []);

  return (
    <div className="d-flex">
      <Sidebar />

      <div className="container mt-4">
        <h3 className="mb-3">👤 Users</h3>

        <div className="card shadow p-3">
          <table className="table table-striped text-center">
            <thead className="table-dark">
              <tr>
                <th>Name</th>
                <th>Email</th>
              </tr>
            </thead>

            <tbody>
              {data.length > 0 ? (
                data.map(user => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2">No Users Found</td>
                </tr>
              )}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
}

export default Users;