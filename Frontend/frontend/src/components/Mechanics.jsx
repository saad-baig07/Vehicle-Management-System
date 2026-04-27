import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

function Mechanics() {
  const [mechanics, setMechanics] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    skills: "",
    status: "Available",
    area: "",
    lat: "",
    lng: ""
  });

  const loadMechanics = () => {
    axios.get("http://localhost:5000/api/mechanics").then((res) => setMechanics(res.data));
  };

  useEffect(() => {
    loadMechanics();
  }, []);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const saveMechanic = async (e) => {
    e.preventDefault();
    await axios.post("http://localhost:5000/api/mechanics", {
      name: form.name,
      email: form.email,
      phone: form.phone,
      skills: form.skills.split(",").map((skill) => skill.trim()).filter(Boolean),
      status: form.status,
      location: {
        area: form.area,
        lat: Number(form.lat || 0),
        lng: Number(form.lng || 0)
      }
    });
    setForm({ name: "", email: "", phone: "", skills: "", status: "Available", area: "", lat: "", lng: "" });
    loadMechanics();
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <Navbar />
        <section className="section-header">
          <h3>Mechanic Resource Management</h3>
          <p>Maintain skill, proximity, workload, and availability data for smart dispatch.</p>
        </section>

        <section className="panel">
          <form className="form-grid" onSubmit={saveMechanic}>
            <label>Name<input value={form.name} onChange={(e) => update("name", e.target.value)} required /></label>
            <label>Email<input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required /></label>
            <label>Phone<input value={form.phone} onChange={(e) => update("phone", e.target.value)} /></label>
            <label>Skills<input placeholder="Oil Change, General Service" value={form.skills} onChange={(e) => update("skills", e.target.value)} required /></label>
            <label>Status<select value={form.status} onChange={(e) => update("status", e.target.value)}><option>Available</option><option>Busy</option><option>Offline</option></select></label>
            <label>Area<input value={form.area} onChange={(e) => update("area", e.target.value)} /></label>
            <label>Latitude<input type="number" step="any" value={form.lat} onChange={(e) => update("lat", e.target.value)} /></label>
            <label>Longitude<input type="number" step="any" value={form.lng} onChange={(e) => update("lng", e.target.value)} /></label>
            <button className="primary-action" type="submit">Add Mechanic</button>
          </form>
        </section>

        <div className="record-grid">
          {mechanics.map((mechanic) => (
            <article className="record-card" key={mechanic._id}>
              <div>
                <h4>{mechanic.name}</h4>
                <span>{mechanic.status} - {mechanic.location?.area || "No area"}</span>
              </div>
              <dl>
                <dt>Phone</dt>
                <dd>{mechanic.phone || "Not set"}</dd>
                <dt>Email</dt>
                <dd>{mechanic.email || "Not linked"}</dd>
                <dt>Skills</dt>
                <dd>{mechanic.skills?.join(", ") || "General"}</dd>
                <dt>Workload</dt>
                <dd>{mechanic.currentWorkload}</dd>
                <dt>GPS</dt>
                <dd>{mechanic.location?.lat || 0}, {mechanic.location?.lng || 0}</dd>
              </dl>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Mechanics;
