import { Link } from "react-router-dom";

function RoleSelection() {
  const handleRole = (role) => {
    localStorage.setItem("role", role);
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (user) {
      localStorage.setItem("user", JSON.stringify({ ...user, role }));
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card role-card">
        <div className="auth-header">
          <span className="brand-badge">Salon Management</span>
          <h1>Choose your portal</h1>
          <p>Select how you want to use the salon system.</p>
        </div>

        <div className="role-grid">
          <Link to="/admin/dashboard" className="role-box" onClick={() => handleRole("admin")}>
            <h3>Admin</h3>
            <p>Manage staff, services, slots, and appointments</p>
          </Link>

          <Link to="/customer/dashboard" className="role-box" onClick={() => handleRole("customer")}>
            <h3>Customer</h3>
            <p>Book services and view your appointments</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RoleSelection;
