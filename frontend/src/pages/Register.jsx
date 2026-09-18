import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/authApi";
import { applyAuthSession } from "../utils/authSession";
import { fetchSalonsFromApi } from "../utils/salonData";
import { useToast } from "../context/ToastContext";

function Register() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    adminSecret: "",
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
      const response = await registerUser(formData);

      if (response.data.success) {
        const user = response.data.user;
        localStorage.setItem("token", response.data.token);
        applyAuthSession({ user, salons: response.data.salons, activeSalonId: response.data.activeSalonId });
        await fetchSalonsFromApi();
        showToast("Account created successfully.");
        navigate("/role-selection");
      }
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.message || "Registration failed", "error");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <span className="brand-badge">SalonPro</span>
          <h1>Create your account</h1>
          <p>Join now and start managing appointments with a sleek business dashboard.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              className="form-input"
              type="text"
              name="name"
              placeholder="Your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              className="form-input"
              type="tel"
              name="phone"
              placeholder="123-456-7890"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              className="form-input"
              type="email"
              name="email"
              placeholder="hello@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              className="form-input"
              type="password"
              name="password"
              placeholder="Choose a secure password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="adminSecret">Admin Secret (optional)</label>
            <input
              id="adminSecret"
              className="form-input"
              type="password"
              name="adminSecret"
              placeholder="Only for admin creation"
              value={formData.adminSecret}
              onChange={handleChange}
            />
          </div>

          <button className="form-button" type="submit">
            Register
          </button>
        </form>

        <div className="auth-footer">
          <span>Already have an account?</span>
          <Link to="/login">Login instead</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;