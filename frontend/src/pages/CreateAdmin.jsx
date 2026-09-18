import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createAdminUser } from "../api/authApi";
import { applyAuthSession } from "../utils/authSession";
import { fetchSalonsFromApi } from "../utils/salonData";
import { useToast } from "../context/ToastContext";

function CreateAdmin() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    adminSecret: import.meta.env.VITE_ADMIN_CREATE_SECRET || "salon-admin-secret",
    salonName: "",
    salonPhone: "",
    salonAddress: "",
    openTime: "09:00",
    closeTime: "21:00",
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
        applyAuthSession({
          user,
          salon: response.data.salon,
          salons: response.data.salon ? [response.data.salon] : [],
          activeSalonId: response.data.activeSalonId,
        });
        await fetchSalonsFromApi();
        showToast("Admin account and salon profile created successfully.");
        navigate("/admin/dashboard");
      }
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.message || "Admin creation failed", "error");
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

          <div className="input-group">
            <label htmlFor="salonName">Salon Name</label>
            <input id="salonName" className="form-input" type="text" name="salonName" placeholder="Glow Studio" value={formData.salonName} onChange={handleChange} required />
          </div>

          <div className="input-group">
            <label htmlFor="salonPhone">Salon Phone</label>
            <input id="salonPhone" className="form-input" type="tel" name="salonPhone" placeholder="9876543210" value={formData.salonPhone} onChange={handleChange} required />
          </div>

          <div className="input-group">
            <label htmlFor="salonAddress">Salon Address</label>
            <textarea id="salonAddress" className="form-input" rows="3" name="salonAddress" placeholder="Shop address" value={formData.salonAddress} onChange={handleChange} required />
          </div>

          <div className="form-row">
            <div className="input-group">
              <label htmlFor="openTime">Open Time</label>
              <input id="openTime" className="form-input" type="time" name="openTime" value={formData.openTime} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label htmlFor="closeTime">Close Time</label>
              <input id="closeTime" className="form-input" type="time" name="closeTime" value={formData.closeTime} onChange={handleChange} required />
            </div>
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
