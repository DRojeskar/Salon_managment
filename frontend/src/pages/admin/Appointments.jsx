import { useEffect, useState } from "react";
import { createAppointment, deleteAppointment, getAppointments, getStaff, getServices, updateAppointment } from "../../api/salonApi";

const emptyForm = {
  client: "",
  service: "",
  time: "",
  staff: "",
  status: "Confirmed",
};

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appointmentsRes, servicesRes, staffRes] = await Promise.all([getAppointments(), getServices(), getStaff()]);
      setAppointments(appointmentsRes.data.appointments || []);
      setServices(servicesRes.data.services || []);
      setStaff(staffRes.data.staff || []);
    } catch (error) {
      console.error("Failed to load appointment data", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ ...emptyForm, service: services[0]?.title || "", staff: staff[0]?.name || "" });
    setEditingId(null);
  };

  useEffect(() => {
    if (services.length && staff.length && !editingId) {
      setFormData((prev) => ({
        ...prev,
        service: prev.service || services[0]?.title || "",
        staff: prev.staff || staff[0]?.name || "",
      }));
    }
  }, [services, staff]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.client.trim() || !formData.time.trim()) {
      return;
    }

    try {
      if (editingId) {
        await updateAppointment(editingId, formData);
      } else {
        await createAppointment(formData);
      }
      await fetchData();
      resetForm();
    } catch (error) {
      console.error("Failed to save appointment", error);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      client: item.client,
      service: item.service,
      time: item.time,
      staff: item.staff,
      status: item.status,
    });
  };

  const handleDelete = async (id) => {
    try {
      await deleteAppointment(id);
      await fetchData();
      if (editingId === id) resetForm();
    } catch (error) {
      console.error("Failed to delete appointment", error);
    }
  };

  return (
    <section className="panel-card">
      <div className="panel-header">
        <h4>Appointment list</h4>
        <span className="topbar-pill">{appointments.length} bookings</span>
      </div>

      <form className="inline-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <input className="form-input" placeholder="Client" value={formData.client} onChange={(e) => setFormData((prev) => ({ ...prev, client: e.target.value }))} required />
          <select className="form-input" value={formData.service} onChange={(e) => setFormData((prev) => ({ ...prev, service: e.target.value }))}>
            {services.map((service) => (
              <option key={service.id} value={service.title}>{service.title}</option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <input className="form-input" placeholder="Time" value={formData.time} onChange={(e) => setFormData((prev) => ({ ...prev, time: e.target.value }))} required />
          <select className="form-input" value={formData.staff} onChange={(e) => setFormData((prev) => ({ ...prev, staff: e.target.value }))}>
            {staff.map((member) => (
              <option key={member.id} value={member.name}>{member.name}</option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <select className="form-input" value={formData.status} onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}>
            <option value="Confirmed">Confirmed</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </select>
          <button className="form-button compact" type="submit">{editingId ? "Save booking" : "New booking"}</button>
          <button className="ghost-btn" type="button" onClick={resetForm}>Cancel</button>
        </div>
      </form>

      {loading ? (
        <div>Loading appointments...</div>
      ) : (
        <div className="list-stack">
          {appointments.map((item) => (
            <div key={item.id} className="list-item">
              <div>
                <strong>{item.client}</strong>
                <p>{item.service}</p>
              </div>
              <div className="list-meta">
                <span>{item.time}</span>
                <small>{item.staff}</small>
                <span className="status-pill">{item.status}</span>
              </div>
              <div className="action-row">
                <button className="ghost-btn" type="button" onClick={() => handleEdit(item)}>Edit</button>
                <button className="ghost-btn" type="button" onClick={() => handleDelete(item.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default Appointments;
