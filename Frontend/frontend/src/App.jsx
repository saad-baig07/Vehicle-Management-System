import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import CustomerDashboard from "./components/CustomerDashboard";
import VehicleList from "./components/VehicleList";
import AddVehicle from "./components/AddVehicle";
import ServiceForm from "./components/ServiceForm";
import ServiceTracker from "./components/ServiceTracker";
import EmergencySOS from "./components/EmergencySOS";

const homeForRole = (role) => {
  if (role === "Mechanic") return "/mechanic/jobs";
  return "/customer";
};

function RoleRoute({ allowed, children }) {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!user) return <Navigate to="/" replace />;

  const role = ["Customer", "Mechanic"].includes(user.role) ? user.role : "Customer";
  if (!allowed.includes(role)) return <Navigate to={homeForRole(role)} replace />;

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/customer" element={<RoleRoute allowed={["Customer"]}><CustomerDashboard /></RoleRoute>} />
        <Route path="/vehicles" element={<RoleRoute allowed={["Customer"]}><VehicleList /></RoleRoute>} />
        <Route path="/add-vehicle" element={<RoleRoute allowed={["Customer"]}><AddVehicle /></RoleRoute>} />
        <Route path="/service" element={<RoleRoute allowed={["Customer"]}><ServiceForm /></RoleRoute>} />
        <Route path="/tracking" element={<RoleRoute allowed={["Customer", "Mechanic"]}><ServiceTracker /></RoleRoute>} />
        <Route path="/mechanic/jobs" element={<RoleRoute allowed={["Mechanic"]}><ServiceTracker /></RoleRoute>} />
        <Route path="/sos" element={<RoleRoute allowed={["Customer"]}><EmergencySOS /></RoleRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
