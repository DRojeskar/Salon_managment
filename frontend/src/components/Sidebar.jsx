import { NavLink, useNavigate } from "react-router-dom";

const navItems = [
  { to: "/dashboard", label: "Overview", icon: "◉" },
  { to: "/dashboard/appointments", label: "Appointments", icon: "◌" },
  { to: "/dashboard/clients", label: "Clients", icon: "◍" },
  { to: "/dashboard/services", label: "Services", icon: "◎" },
];

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div>
        <div className="brand-block">
          <span className="brand-icon">✂</span>
          <div>
            <p className="eyebrow">Salon Pro</p>
            <h3>Glow Studio</h3>
          </div>
        </div>

        <nav className="nav-links">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </aside>
  );
}

export default Sidebar;
