import { useEffect, useMemo, useState } from "react";
import { createService, deleteService, getServices, updateService } from "../../api/salonApi";

const defaultCategories = [
  "Hair - Cut & Styling", "Hair - Color & Highlights", "Hair - Spa & Treatment", "Beard & Moustache",
  "Skin - Facial & Cleanup", "Skin - Bleach & D-Tan", "Nails - Manicure & Pedicure", "Nails - Nail Art & Extensions",
  "Makeup - Party & Bridal", "Body Spa & Massage", "Waxing & Threading", "Packages & Combos",
  "AI Try-On Exclusive", "Events & Bridal", "Kids & Others",
];

const filterChips = ["All", "Hair", "Beard", "Skin", "Nails", "Makeup", "Spa", "Waxing", "Packages", "AI"];
const categoryColors = {
  Hair: "#a855f7", Beard: "#3b82f6", Skin: "#ec4899", Nails: "#f97316", Makeup: "#ef4444",
  "Body Spa": "#14b8a6", Waxing: "#eab308", Packages: "#8b5cf6", AI: "#06b6d4", Events: "#f43f5e", Kids: "#64748b",
};

const emptyForm = { title: "", price: "", duration: "", category: defaultCategories[0] };

function getCategoryColor(category = "") {
  const key = Object.keys(categoryColors).find((name) => category.startsWith(name));
  return categoryColors[key] || "#94a3b8";
}

function categoryMatchesFilter(category = "", filter) {
  if (filter === "All") return true;
  if (filter === "Spa") return category.startsWith("Body Spa") || category.includes("Spa");
  return category.startsWith(filter);
}

function readStoredServices() {
  try {
    return JSON.parse(localStorage.getItem("glow_services") || "[]");
  } catch {
    return [];
  }
}

function CategoryPicker({ value, categories, onChange, onAddCategory }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [customName, setCustomName] = useState("");
  const filteredCategories = categories.filter((category) => category.toLowerCase().includes(query.toLowerCase()));

  const saveCustomCategory = () => {
    const name = customName.trim();
    if (!name) return;
    const nextCategories = Array.from(new Set([...categories, name]));
    localStorage.setItem("glow_service_categories", JSON.stringify(nextCategories.filter((category) => !defaultCategories.includes(category))));
    onAddCategory(nextCategories);
    onChange(name);
    setCustomName("");
    setQuery("");
  };

  return (
    <div className="category-picker">
      <button className="form-input category-picker-trigger" type="button" onClick={() => setOpen((current) => !current)}>{value}<span>⌄</span></button>
      {open && <div className="category-picker-menu">
        <input autoFocus className="category-picker-search" placeholder="Search category..." value={query} onChange={(event) => setQuery(event.target.value)} />
        <div className="category-picker-options">
          {filteredCategories.map((category) => <button type="button" key={category} className={category === value ? "selected" : ""} onClick={() => { onChange(category); setOpen(false); }}>{category}</button>)}
        </div>
        <div className="category-picker-custom">
          <input className="category-picker-search" placeholder="New custom category" value={customName} onChange={(event) => setCustomName(event.target.value)} />
          <button type="button" onClick={saveCustomCategory}>+ Add New Custom Category</button>
        </div>
      </div>}
    </div>
  );
}

function Services() {
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState(() => {
    try {
      return Array.from(new Set([...defaultCategories, ...JSON.parse(localStorage.getItem("glow_service_categories") || "[]")]));
    } catch {
      return defaultCategories;
    }
  });
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetchServices();
  }, []);

  async function fetchServices() {
    try {
      setLoading(true);
      const response = await getServices();
      const apiServices = response.data.services || [];
      const storedServices = readStoredServices();
      const apiIds = new Set(apiServices.map((service) => String(service.id)));
      setServices([...apiServices, ...storedServices.filter((service) => !apiIds.has(String(service.id)))]);
    } catch (error) {
      setServices(readStoredServices());
      console.error("Failed to load services", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredServices = useMemo(() => services.filter((service) => categoryMatchesFilter(service.category, filter)), [services, filter]);

  const resetForm = () => { setFormData(emptyForm); setEditingId(null); };

  const saveLocalService = (service) => {
    const localService = {
      id: service.id || Date.now(), name: service.name || service.title, title: service.title || service.name,
      price: Number(service.price) || 0, duration: Number(service.duration) || 30, category: service.category, createdAt: service.createdAt || new Date().toISOString(),
    };
    const stored = readStoredServices();
    const next = stored.some((item) => String(item.id) === String(localService.id))
      ? stored.map((item) => String(item.id) === String(localService.id) ? localService : item)
      : [localService, ...stored];
    localStorage.setItem("glow_services", JSON.stringify(next));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.title.trim()) return;
    const payload = { ...formData, price: Number(formData.price) || 0, duration: Number(formData.duration) || 30 };
    try {
      if (editingId) {
        await updateService(editingId, payload);
        saveLocalService({ ...payload, id: editingId, createdAt: formData.createdAt || new Date().toISOString() });
      } else {
        const response = await createService(payload);
        const savedService = response.data.service || { ...payload, id: Date.now() };
        saveLocalService({ ...savedService, createdAt: new Date().toISOString() });
      }
      await fetchServices();
      resetForm();
    } catch (error) {
      const fallback = { ...payload, id: editingId || Date.now(), createdAt: new Date().toISOString() };
      saveLocalService(fallback);
      setServices((current) => editingId ? current.map((service) => String(service.id) === String(editingId) ? fallback : service) : [fallback, ...current]);
      resetForm();
      console.error("Service API unavailable; saved locally", error);
    }
  };

  const handleEdit = (service) => {
    setEditingId(service.id);
    setFormData({ title: service.title || service.name || "", price: service.price, duration: service.duration, category: service.category || defaultCategories[0], createdAt: service.createdAt });
  };

  const handleDelete = async (id) => {
    try { await deleteService(id); } catch (error) { console.error("Service API delete failed", error); }
    const next = services.filter((service) => String(service.id) !== String(id));
    setServices(next);
    localStorage.setItem("glow_services", JSON.stringify(readStoredServices().filter((service) => String(service.id) !== String(id))));
    if (String(editingId) === String(id)) resetForm();
  };

  return (
    <section className="panel-card services-admin-page">
      <div className="panel-header"><h4>Service catalog</h4><span className="topbar-pill">{services.length} services</span></div>
      <form className="inline-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <input className="form-input" placeholder="Service name" value={formData.title} onChange={(event) => setFormData((current) => ({ ...current, title: event.target.value }))} required />
          <input className="form-input" type="number" placeholder="Price" value={formData.price} onChange={(event) => setFormData((current) => ({ ...current, price: event.target.value }))} required />
        </div>
        <div className="form-row">
          <input className="form-input" type="number" placeholder="Duration (min)" value={formData.duration} onChange={(event) => setFormData((current) => ({ ...current, duration: event.target.value }))} required />
          <CategoryPicker value={formData.category} categories={categories} onChange={(category) => setFormData((current) => ({ ...current, category }))} onAddCategory={setCategories} />
        </div>
        <div className="action-row"><button className="form-button compact" type="submit">{editingId ? "Save changes" : "Add service"}</button><button className="ghost-btn" type="button" onClick={resetForm}>Cancel</button></div>
      </form>

      <div className="service-filter-chips">{filterChips.map((chip) => <button key={chip} type="button" className={filter === chip ? "active" : ""} onClick={() => setFilter(chip)}>{chip}</button>)}</div>

      {loading ? <div>Loading services...</div> : <div className="cards-grid">{filteredServices.map((service) => {
        const title = service.title || service.name;
        const color = getCategoryColor(service.category);
        return <div key={service.id} className="card-tile service-catalog-card">
          <div className="card-top-row"><h5>{title}</h5><div className="service-card-meta"><span className="price-tag">₹{service.price}</span><span className="service-category-badge" style={{ "--category-color": color }}>{service.category || "Uncategorized"}</span></div></div>
          <p>{service.duration} min</p>
          <div className="action-row"><button className="ghost-btn" type="button" onClick={() => handleEdit(service)}>Edit</button><button className="ghost-btn" type="button" onClick={() => handleDelete(service.id)}>Delete</button></div>
        </div>;
      })}</div>}
    </section>
  );
}

export default Services;