import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import VehicleList from "./components/VehicleList";
import AddVehicle from "./components/AddVehicle";
import ServiceForm from "./components/ServiceForm";
import ServiceTracker from "./components/ServiceTracker";
import Mechanics from "./components/Mechanics";
import EmergencySOS from "./components/EmergencySOS";
import Users from "./components/Users";

const homeForRole = (role) => {
  if (role === "Mechanic") return "/mechanic/jobs";
  if (role === "Customer") return "/service";
  return "/dashboard";
};

function RoleRoute({ allowed, children }) {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!user) return <Navigate to="/" replace />;

  const role = ["Customer", "Mechanic", "Admin"].includes(user.role) ? user.role : "Admin";
  if (!allowed.includes(role)) return <Navigate to={homeForRole(role)} replace />;

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<RoleRoute allowed={["Admin"]}><Dashboard /></RoleRoute>} />
        <Route path="/vehicles" element={<RoleRoute allowed={["Customer", "Admin"]}><VehicleList /></RoleRoute>} />
        <Route path="/add-vehicle" element={<RoleRoute allowed={["Customer", "Admin"]}><AddVehicle /></RoleRoute>} />
        <Route path="/service" element={<RoleRoute allowed={["Customer", "Admin"]}><ServiceForm /></RoleRoute>} />
        <Route path="/tracking" element={<RoleRoute allowed={["Customer", "Mechanic", "Admin"]}><ServiceTracker /></RoleRoute>} />
        <Route path="/mechanic/jobs" element={<RoleRoute allowed={["Mechanic", "Admin"]}><ServiceTracker /></RoleRoute>} />
        <Route path="/mechanics" element={<RoleRoute allowed={["Admin"]}><Mechanics /></RoleRoute>} />
        <Route path="/sos" element={<RoleRoute allowed={["Customer", "Admin"]}><EmergencySOS /></RoleRoute>} />
        <Route path="/users" element={<RoleRoute allowed={["Admin"]}><Users /></RoleRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
