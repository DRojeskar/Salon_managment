const stats = [
  { label: "Today bookings", value: "14", detail: "3 pending" },
  { label: "Revenue", value: "₹2.4k", detail: "+12% this week" },
  { label: "Clients", value: "128", detail: "18 new" },
  { label: "Services", value: "9", detail: "Hair + skin" },
];

const appointments = [
  { client: "Riya Sharma", time: "10:30 AM", service: "Hair Styling", status: "Confirmed" },
  { client: "Mina Khan", time: "12:00 PM", service: "Facial Glow", status: "In progress" },
  { client: "Aisha Noor", time: "3:30 PM", service: "Nail Art", status: "Pending" },
];

const quickNotes = [
  "Refresh product stock before the evening rush.",
  "Follow up with 4 clients for package upgrades.",
  "Prepare bridal look samples for tomorrow.",
];

function Dashboard() {
  return (
    <div className="page-stack">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Today’s overview</p>
          <h3>Everything feels under control.</h3>
          <p>Your salon is running smoothly with strong bookings and happy clients.</p>
        </div>
        <div className="hero-chip">Peak hours • 5 PM to 8 PM</div>
      </section>

      <section className="stats-grid">
        {stats.map((item) => (
          <div key={item.label} className="info-card">
            <p>{item.label}</p>
            <h4>{item.value}</h4>
            <span>{item.detail}</span>
          </div>
        ))}
      </section>

      <section className="content-grid">
        <div className="panel-card">
          <div className="panel-header">
            <h4>Upcoming appointments</h4>
            <button className="ghost-btn">View all</button>
          </div>

          <div className="list-stack">
            {appointments.map((appointment) => (
              <div key={`${appointment.client}-${appointment.time}`} className="list-item">
                <div>
                  <strong>{appointment.client}</strong>
                  <p>{appointment.service}</p>
                </div>
                <div className="list-meta">
                  <span>{appointment.time}</span>
                  <small>{appointment.status}</small>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel-card">
          <div className="panel-header">
            <h4>Daily reminders</h4>
            <button className="ghost-btn">Add note</button>
          </div>

          <ul className="note-list">
            {quickNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
