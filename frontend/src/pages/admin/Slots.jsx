import { useEffect, useState } from "react";
import { createSlot, deleteSlot, getSlots, updateSlot } from "../../api/salonApi";

const emptyForm = {
  day: "Today",
  time: "",
  status: "Open",
};

function Slots() {
  const [slots, setSlots] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const response = await getSlots();
      setSlots(response.data.slots || []);
    } catch (error) {
      console.error("Failed to load slots", error);
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
    if (!formData.time.trim()) {
      return;
    }

    try {
      if (editingId) {
        await updateSlot(editingId, formData);
      } else {
        await createSlot(formData);
      }
      await fetchSlots();
      resetForm();
    } catch (error) {
      console.error("Failed to save slot", error);
    }
  };

  const handleEdit = (slot) => {
    setEditingId(slot.id);
    setFormData({ day: slot.day, time: slot.time, status: slot.status });
  };

  const handleDelete = async (id) => {
    try {
      await deleteSlot(id);
      await fetchSlots();
      if (editingId === id) resetForm();
    } catch (error) {
      console.error("Failed to delete slot", error);
    }
  };

  return (
    <section className="panel-card">
      <div className="panel-header">
        <h4>Time slots</h4>
        <span className="topbar-pill">{slots.length} slots</span>
      </div>

      <form className="inline-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <select className="form-input" value={formData.day} onChange={(e) => setFormData((prev) => ({ ...prev, day: e.target.value }))}>
            <option value="Today">Today</option>
            <option value="Tomorrow">Tomorrow</option>
            <option value="Next week">Next week</option>
          </select>
          <input className="form-input" placeholder="Time" value={formData.time} onChange={(e) => setFormData((prev) => ({ ...prev, time: e.target.value }))} required />
        </div>
        <div className="form-row">
          <select className="form-input" value={formData.status} onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}>
            <option value="Open">Open</option>
            <option value="Booked">Booked</option>
          </select>
          <button className="form-button compact" type="submit">{editingId ? "Save slot" : "Add slot"}</button>
          <button className="ghost-btn" type="button" onClick={resetForm}>Cancel</button>
        </div>
      </form>

      {loading ? (
        <div>Loading slots...</div>
      ) : (
        <div className="list-stack">
          {slots.map((slot) => (
            <div key={slot.id} className="list-item">
              <div>
                <strong>{slot.day}</strong>
                <p>{slot.time}</p>
              </div>
              <div className="action-row">
                <span className="status-pill">{slot.status}</span>
                <button className="ghost-btn" type="button" onClick={() => handleEdit(slot)}>Edit</button>
                <button className="ghost-btn" type="button" onClick={() => handleDelete(slot.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default Slots;
