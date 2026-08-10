import { useEffect, useMemo, useState } from "react";
import { getAppointments, getServices, getSlots, getStaff } from "../../api/salonApi";

function AdminDashboard() {
  const [staff, setStaff] = useState([]);
  const [services, setServices] = useState([]);
  const [slots, setSlots] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [staffRes, servicesRes, slotsRes, appointmentsRes] = await Promise.all([
        getStaff(),
        getServices(),
        getSlots(),
        getAppointments(),
      ]);
      setStaff(staffRes.data.staff || []);
      setServices(servicesRes.data.services || []);
      setSlots(slotsRes.data.slots || []);
      setAppointments(appointmentsRes.data.appointments || []);
    } catch (error) {
      console.error("Failed to load admin dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  const openSlots = slots.filter((slot) => slot.status === "Open").length;
  const pendingAppointments = appointments.filter((item) => item.status === "Pending").length;
  const revenue = appointments.reduce((sum, item) => {
    const service = services.find((entry) => entry.title === item.service);
    return sum + (service?.price || 0);
  }, 0);

  const cards = [
    { label: "Staff on duty", value: staff.length.toString(), detail: `${staff.filter((member) => member.status === "Available").length} available` },
    { label: "Today's bookings", value: appointments.length.toString(), detail: `${pendingAppointments} pending` },
    { label: "Open slots", value: openSlots.toString(), detail: "Peak evening" },
    { label: "Revenue", value: `$${revenue}`, detail: "+12% week" },
  ];

  const chartData = useMemo(() => [
    { day: "Mon", value: Math.max(3, Math.round(appointments.length / 4)) },
    { day: "Tue", value: Math.max(4, Math.round(appointments.length / 3)) },
    { day: "Wed", value: Math.max(3, Math.round(appointments.length / 5)) },
    { day: "Thu", value: Math.max(5, Math.round(appointments.length / 3)) },
    { day: "Fri", value: Math.max(6, Math.round(appointments.length / 2)) },
    { day: "Sat", value: Math.max(7, Math.round(appointments.length / 2) + 1) },
  ], [appointments.length]);

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Admin overview</p>
          <h3>Your salon is running smoothly.</h3>
          <p>Monitor staff, services, slots, and bookings from one screen.</p>
        </div>
        <div className="hero-chip">Today • {appointments.length} appointments</div>
      </section>

      <section className="stats-grid">
        {cards.map((card) => (
          <div key={card.label} className="info-card">
            <p>{card.label}</p>
            <h4>{card.value}</h4>
            <span>{card.detail}</span>
          </div>
        ))}
      </section>

      <section className="panel-card">
        <div className="panel-header">
          <h4>Weekly demand</h4>
          <span className="topbar-pill">Live salon activity</span>
        </div>

        {loading ? (
          <div>Loading metrics...</div>
        ) : (
          <div className="chart-bars">
            {chartData.map((item) => (
              <div key={item.day} className="chart-column">
                <div className="bar-track">
                  <div className="bar-fill" style={{ height: `${Math.max(28, item.value * 12)}%` }} />
                </div>
                <span>{item.day}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminDashboard;
