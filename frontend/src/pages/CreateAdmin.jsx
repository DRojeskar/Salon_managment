import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createAdminUser } from "../api/authApi";

function CreateAdmin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    adminSecret: import.meta.env.VITE_ADMIN_CREATE_SECRET || "salon-admin-secret",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await createAdminUser(formData);

      if (response.data.success) {
        const user = response.data.user;
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("role", user.role || "admin");
        navigate("/role-selection");
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Admin creation failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <span className="brand-badge">SalonPro</span>
          <h1>Create Admin Account</h1>
          <p>Use this page only to create a secure admin user for the salon dashboard.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="name">Full Name</label>
            <input id="name" className="form-input" type="text" name="name" placeholder="Admin name" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="input-group">
            <label htmlFor="phone">Phone</label>
            <input id="phone" className="form-input" type="tel" name="phone" placeholder="123-456-7890" value={formData.phone} onChange={handleChange} required />
          </div>

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input id="email" className="form-input" type="email" name="email" placeholder="admin@example.com" value={formData.email} onChange={handleChange} required />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input id="password" className="form-input" type="password" name="password" placeholder="Strong password" value={formData.password} onChange={handleChange} required />
          </div>

          <div className="input-group">
            <label htmlFor="adminSecret">Admin Secret</label>
            <input id="adminSecret" className="form-input" type="password" name="adminSecret" placeholder="Enter admin secret" value={formData.adminSecret} onChange={handleChange} required />
          </div>

          <button className="form-button" type="submit">Create Admin</button>
        </form>

        <div className="auth-footer">
          <Link to="/login">Back to login</Link>
        </div>
      </div>
    </div>
  );
}

export default CreateAdmin;
