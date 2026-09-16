import { NavLink, Outlet, useNavigate } from "react-router-dom";

const links = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/staff", label: "Staff" },
  { to: "/admin/services", label: "Services" },
  { to: "/admin/slots", label: "Slots" },
  { to: "/admin/appointments", label: "Appointments" },
  { to: "/admin/bookings", label: "Bookings" },
  { to: "/admin/ai-insights", label: "AI Insights" },
  { to: "/admin/marketing-dashboard", label: "Marketing" },
];

function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <div className="brand-block">
            <span className="brand-icon">✂</span>
            <div>
              <p className="eyebrow">Admin portal</p>
              <h3>Glow Studio</h3>
            </div>
          </div>

          <nav className="nav-links">
            {links.map((item) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Salon management</p>
            <h2>Admin control center</h2>
          </div>
          <div className="topbar-actions"><div className="topbar-pill">Live salon operations</div><button className="header-logout-btn" onClick={handleLogout}>Logout</button></div>
        </header>

        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
