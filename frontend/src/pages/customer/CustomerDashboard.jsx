import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createBooking, getBookings, getServices } from "../../api/salonApi";

const emptyForm = {
  client: "",
  service: "",
  staff: "",
  source: "normal",
  date: "",
  time: "",
};

function CustomerDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const handoffBooking = location.state?.booking?.source === "ai_style_studio" ? location.state.booking : {};
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [formData, setFormData] = useState({
    ...emptyForm,
    client: storedUser?.name || "",
    ...handoffBooking,
    time: handoffBooking.source === "ai_style_studio" ? handoffBooking.time || "11:00" : "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const booking = location.state?.booking;
    if (!booking || booking.source !== "ai_style_studio") {
      setFormData((current) => ({ ...emptyForm, client: storedUser?.name || current.client || "" }));
      return;
    }
    setFormData((current) => ({
      ...current,
      ...booking,
      time: booking.source === "ai_style_studio" ? booking.time || current.time || "11:00" : "",
    }));
  }, [location.state]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [servicesRes, bookingsRes] = await Promise.all([getServices(), getBookings()]);
      const nextServices = servicesRes.data.services || [];
      setServices(nextServices);
      setBookings(bookingsRes.data.bookings || []);

      setFormData((prev) => ({ ...prev }));
    } catch (error) {
      console.error("Failed to load customer dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const selectedService = (formData.service || services[0]?.title || "").trim();

    if (!formData.client.trim() || !selectedService || !formData.date.trim() || !formData.time.trim()) {
      alert("Please fill in your name, select a service, and choose a date/time.");
      return;
    }

    const booking = {
      client: formData.client,
      service: selectedService,
      staff: formData.staff,
      source: formData.source || "normal",
      date: `${formData.date} • ${formData.time}`,
      status: "Pending",
    };

    try {
      await createBooking(booking);
      setFormData({ ...emptyForm, client: storedUser?.name || "" });
      navigate("/customer/dashboard", { replace: true, state: null });
      await fetchData();
    } catch (error) {
      console.error("Failed to create booking", error);
      alert(error.response?.data?.message || "Booking failed");
    }
  };

  const demandData = useMemo(() => [
    { day: "Mon", value: Math.min(7, 2 + bookings.length) },
    { day: "Tue", value: Math.min(7, 3 + bookings.length) },
    { day: "Wed", value: Math.min(7, 2 + Math.floor(bookings.length / 2)) },
    { day: "Thu", value: Math.min(7, 4 + Math.floor(bookings.length / 2)) },
    { day: "Fri", value: Math.min(7, 5 + bookings.length) },
    { day: "Sat", value: Math.min(7, 6 + bookings.length) },
  ], [bookings.length]);

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Customer portal</p>
          <h3>Book the service you love.</h3>
          <p>Choose a service, pick a slot, and manage your appointments with ease.</p>
        </div>
        <div className="hero-chip">Fresh availability</div>
      </section>

      <section className="panel-card">
        <div className="panel-header">
          <h4>Book a service</h4>
        </div>

        <form className="inline-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <input className="form-input" placeholder="Your name" value={formData.client} onChange={(e) => setFormData((prev) => ({ ...prev, client: e.target.value }))} required />
            <select className="form-input" value={formData.service} onChange={(e) => setFormData((prev) => ({ ...prev, service: e.target.value }))} required>
              <option value="" disabled>Select a service</option>
              {services.map((service) => (
                <option key={service.id} value={service.title}>{service.title}</option>
              ))}
            </select>
          </div>
          {formData.staff && <p className="booking-context">Preferred stylist: <strong>{formData.staff}</strong></p>}
          <div className="form-row">
            <input className="form-input" type="date" value={formData.date} onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))} required />
            <input className="form-input" type="time" value={formData.time} onChange={(e) => setFormData((prev) => ({ ...prev, time: e.target.value }))} required />
          </div>
          <button className="form-button compact" type="submit">
            {formData.source === "ai_style_studio"
              ? `Pay ₹${Math.round((services.find((service) => service.title === formData.service)?.price || 0) * 0.9).toLocaleString("en-IN")} & confirm`
              : "Reserve appointment"}
          </button>
        </form>
      </section>

      <section className="panel-card">
        <div className="panel-header">
          <h4>Popular services</h4>
        </div>

        {loading ? (
          <div>Loading services...</div>
        ) : (
          <div className="cards-grid">
            {services.map((service) => (
              <div key={service.id} className="card-tile">
                <h5>{service.title}</h5>
                <p>{service.duration} min</p>
                <span className="price-tag">₹{service.price}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="panel-card">
        <div className="panel-header">
          <h4>Demand preview</h4>
        </div>

        <div className="chart-bars">
          {demandData.map((item) => (
            <div key={item.day} className="chart-column">
              <div className="bar-track">
                <div className="bar-fill" style={{ height: `${Math.max(24, item.value * 12)}%` }} />
              </div>
              <span>{item.day}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="panel-card">
        <div className="panel-header">
          <h4>Your appointments</h4>
        </div>

        {loading ? (
          <div>Loading bookings...</div>
        ) : (
          <div className="list-stack">
            {bookings.map((item) => (
              <div key={item.id} className="list-item">
                <div>
                  <strong>{item.service}</strong>
                  <p>{item.date}</p>
                </div>
                <span className="status-pill">{item.status}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default CustomerDashboard;
