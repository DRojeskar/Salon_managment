import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api/authApi";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
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
      const response = await loginUser(formData);

      if (response.data.success) {
        const user = response.data.user;
        const role = user?.role || "customer";
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("role", role);
        navigate(role === "admin" ? "/admin/dashboard" : "/customer/dashboard");
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-page">
      <section className="salon-showcase" aria-label="Glow Studio services">
        <div className="salon-showcase-copy">
          <p className="eyebrow">Glow Studio • Salon Management</p>
          <h2>Your salon.<br /><span>Sharper, brighter, smarter.</span></h2>
          <p>Manage every appointment, stylist, service and customer from one beautiful workspace.</p>
        </div>
        <div className="salon-service-visuals">
          <div className="salon-service-tile haircut-tile"><span>✂</span><strong>Hair Cut</strong><small>Precision styling</small></div>
          <div className="salon-service-tile spa-tile"><span>◌</span><strong>Hair Spa</strong><small>Deep care ritual</small></div>
          <div className="salon-service-tile glow-tile"><span>✦</span><strong>Skin &amp; Glow</strong><small>Fresh salon finish</small></div>
        </div>
        <div className="salon-showcase-footer"><span>Hair • Spa • Beauty • Bookings</span><span>HD SALON EXPERIENCE</span></div>
      </section>
      <div className="auth-card">
        <div className="auth-header">
          <span className="brand-badge">SalonPro</span>
          <h1>Welcome Back</h1>
          <p>Login to manage bookings, clients, and appointments from one clean dashboard.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
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
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button className="form-button" type="submit">
            Login
          </button>
        </form>

        <div className="auth-footer">
          <span>New here?</span>
          <Link to="/register">Create an account</Link>
        </div>

        <div className="auth-footer" style={{ marginTop: "0.5rem" }}>
          <Link to="/create-admin">Create admin account</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;