import { NavLink, Outlet, useNavigate } from "react-router-dom";
import Chatbot from "../../components/Chatbot";
import { useActiveSalonName } from "../../hooks/useActiveSalonName";

const links = [
  { to: "/customer/dashboard", label: "Dashboard" },
  { to: "/my-bookings", label: "My Bookings" },
  { to: "/customer/style-studio", label: "AI Style Studio" },
  { to: "/customer/ai-try-on", label: "AI Try-On" },
];

function CustomerLayout() {
  const navigate = useNavigate();
  const salonName = useActiveSalonName("Choose salon");

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
              <p className="eyebrow">Customer portal</p>
              <h3>{salonName}</h3>
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
            <p className="eyebrow">Customer</p>
            <h2>Book your perfect salon visit</h2>
          </div>
          <div className="topbar-actions"><div className="topbar-pill">Easy appointments</div><button className="header-logout-btn" onClick={handleLogout}>Logout</button></div>
        </header>

        <Outlet />
      </main>
      <Chatbot />
    </div>
  );
}

export default CustomerLayout;
