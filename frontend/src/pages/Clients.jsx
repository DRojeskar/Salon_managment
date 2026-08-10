const clients = [
  { name: "Riya Sharma", phone: "+92 300 1234567", visits: 6, favorite: "Haircut + Blowout" },
  { name: "Mina Khan", phone: "+92 310 9876543", visits: 3, favorite: "Facial Glow" },
  { name: "Aisha Noor", phone: "+92 333 4567890", visits: 8, favorite: "Nail Art" },
  { name: "Zara Ali", phone: "+92 320 6543210", visits: 10, favorite: "Bridal Makeup" },
];

function Clients() {
  return (
    <div className="page-stack">
      <section className="panel-card">
        <div className="panel-header">
          <h4>Client directory</h4>
          <button className="ghost-btn">Add client</button>
        </div>

        <div className="cards-grid">
          {clients.map((client) => (
            <div key={client.name} className="card-tile">
              <div className="avatar">{client.name.charAt(0)}</div>
              <h5>{client.name}</h5>
              <p>{client.phone}</p>
              <span>{client.visits} visits</span>
              <small>{client.favorite}</small>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Clients;
