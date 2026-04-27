import { Link } from "react-router-dom";

function Sidebar() {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const role = user.role || "Customer";

  const linksByRole = {
    Customer: [
      ["/service", "Book Service"],
      ["/tracking", "My Tracking"],
      ["/vehicles", "My Vehicle Health"],
      ["/add-vehicle", "Add Vehicle"],
      ["/sos", "Emergency SOS"]
    ],
    Mechanic: [
      ["/mechanic/jobs", "Assigned Jobs"],
      ["/tracking", "Quote & Status Updates"]
    ],
    Admin: [
      ["/dashboard", "Command Center"],
      ["/vehicles", "Vehicle Health"],
      ["/add-vehicle", "Add Vehicle"],
      ["/service", "Book Service"],
      ["/tracking", "Tracking & Quotes"],
      ["/mechanics", "Mechanics"],
      ["/sos", "Emergency SOS"],
      ["/users", "Users"]
    ]
  };

  const links = linksByRole[role] || linksByRole.Customer;

  return (
    <aside className="sidebar">
      <div>
        <h4>AutoCare</h4>
        <p>{role} portal</p>
      </div>

      <nav>
        {links.map(([to, label]) => (
          <Link key={to} to={to}>
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
