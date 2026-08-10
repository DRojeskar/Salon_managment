const services = [
  { title: "Hair Styling", price: "$45", description: "Modern cut, styling, and finishing touch." },
  { title: "Facial Glow", price: "$35", description: "Glow facial with hydration and massage." },
  { title: "Nail Art", price: "$25", description: "Trendy nail design with premium finish." },
  { title: "Bridal Makeup", price: "$90", description: "Signature bridal look for special occasions." },
];

function Services() {
  return (
    <div className="page-stack">
      <section className="panel-card">
        <div className="panel-header">
          <h4>Service menu</h4>
          <button className="ghost-btn">Edit services</button>
        </div>

        <div className="cards-grid">
          {services.map((service) => (
            <div key={service.title} className="card-tile">
              <h5>{service.title}</h5>
              <p>{service.description}</p>
              <span className="price-tag">{service.price}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Services;
