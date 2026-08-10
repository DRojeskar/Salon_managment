import { useEffect, useState } from "react";
import { createService, deleteService, getServices, updateService } from "../../api/salonApi";

const emptyForm = {
  title: "",
  price: "",
  duration: "",
  category: "Hair",
};

function Services() {
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await getServices();
      setServices(response.data.services || []);
    } catch (error) {
      console.error("Failed to load services", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      return;
    }

    const payload = {
      ...formData,
      price: Number(formData.price) || 0,
      duration: Number(formData.duration) || 30,
    };

    try {
      if (editingId) {
        await updateService(editingId, payload);
      } else {
        await createService(payload);
      }
      await fetchServices();
      resetForm();
    } catch (error) {
      console.error("Failed to save service", error);
    }
  };

  const handleEdit = (service) => {
    setEditingId(service.id);
    setFormData({
      title: service.title,
      price: service.price,
      duration: service.duration,
      category: service.category,
    });
  };

  const handleDelete = async (id) => {
    try {
      await deleteService(id);
      await fetchServices();
      if (editingId === id) resetForm();
    } catch (error) {
      console.error("Failed to delete service", error);
    }
  };

  return (
    <section className="panel-card">
      <div className="panel-header">
        <h4>Service catalog</h4>
        <span className="topbar-pill">{services.length} services</span>
      </div>

      <form className="inline-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <input className="form-input" placeholder="Service name" value={formData.title} onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))} required />
          <input className="form-input" type="number" placeholder="Price" value={formData.price} onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))} required />
        </div>
        <div className="form-row">
          <input className="form-input" type="number" placeholder="Duration (min)" value={formData.duration} onChange={(e) => setFormData((prev) => ({ ...prev, duration: e.target.value }))} required />
          <select className="form-input" value={formData.category} onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}>
            <option value="Hair">Hair</option>
            <option value="Skin">Skin</option>
            <option value="Nails">Nails</option>
            <option value="Events">Events</option>
          </select>
        </div>
        <div className="action-row">
          <button className="form-button compact" type="submit">{editingId ? "Save changes" : "Add service"}</button>
          <button className="ghost-btn" type="button" onClick={resetForm}>Cancel</button>
        </div>
      </form>

      {loading ? (
        <div>Loading services...</div>
      ) : (
        <div className="cards-grid">
          {services.map((service) => (
            <div key={service.id} className="card-tile">
              <div className="card-top-row">
                <h5>{service.title}</h5>
                <span className="price-tag">${service.price}</span>
              </div>
              <p>{service.duration} min • {service.category}</p>
              <div className="action-row">
                <button className="ghost-btn" type="button" onClick={() => handleEdit(service)}>Edit</button>
                <button className="ghost-btn" type="button" onClick={() => handleDelete(service.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default Services;
