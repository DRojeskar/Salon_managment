const appointments = [
  { client: "Riya Sharma", service: "Hair Styling", time: "10:30 AM", stylist: "Nadia", status: "Confirmed" },
  { client: "Mina Khan", service: "Facial Glow", time: "12:00 PM", stylist: "Sara", status: "In progress" },
  { client: "Aisha Noor", service: "Nail Art", time: "3:30 PM", stylist: "Lina", status: "Pending" },
  { client: "Zara Ali", service: "Bridal Makeup", time: "6:00 PM", stylist: "Hania", status: "Confirmed" },
];

function Appointments() {
  return (
    <div className="page-stack">
      <section className="panel-card">
        <div className="panel-header">
          <h4>Appointment schedule</h4>
          <button className="ghost-btn">New booking</button>
        </div>

        <div className="list-stack">
          {appointments.map((item) => (
            <div key={`${item.client}-${item.time}`} className="list-item">
              <div>
                <strong>{item.client}</strong>
                <p>{item.service}</p>
              </div>
              <div className="list-meta">
                <span>{item.time}</span>
                <small>{item.stylist}</small>
              </div>
              <span className="status-pill">{item.status}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Appointments;
