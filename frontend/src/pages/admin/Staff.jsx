import { useEffect, useState } from "react";
import { createStaff, deleteStaff, getStaff, updateStaff } from "../../api/salonApi";

const emptyForm = {
  name: "",
  role: "",
  shift: "Morning",
  status: "Available",
};

function Staff() {
  const [staff, setStaff] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await getStaff();
      setStaff(response.data.staff || []);
    } catch (error) {
      console.error("Failed to load staff", error);
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
    if (!formData.name.trim() || !formData.role.trim()) {
      return;
    }

    try {
      if (editingId) {
        await updateStaff(editingId, formData);
      } else {
        await createStaff(formData);
      }
      await fetchStaff();
      resetForm();
    } catch (error) {
      console.error("Failed to save staff", error);
    }
  };

  const handleEdit = (member) => {
    setEditingId(member.id);
    setFormData({
      name: member.name,
      role: member.role,
      shift: member.shift,
      status: member.status,
    });
  };

  const handleDelete = async (id) => {
    try {
      await deleteStaff(id);
      await fetchStaff();
      if (editingId === id) resetForm();
    } catch (error) {
      console.error("Failed to delete staff", error);
    }
  };

  return (
    <section className="panel-card">
      <div className="panel-header">
        <h4>Staff management</h4>
        <span className="topbar-pill">{staff.length} active profiles</span>
      </div>

      <form className="inline-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <input className="form-input" placeholder="Name" value={formData.name} onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))} required />
          <input className="form-input" placeholder="Role" value={formData.role} onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))} required />
        </div>
        <div className="form-row">
          <select className="form-input" value={formData.shift} onChange={(e) => setFormData((prev) => ({ ...prev, shift: e.target.value }))}>
            <option value="Morning">Morning</option>
            <option value="Afternoon">Afternoon</option>
            <option value="Evening">Evening</option>
          </select>
          <select className="form-input" value={formData.status} onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}>
            <option value="Available">Available</option>
            <option value="On call">On call</option>
            <option value="Booked">Booked</option>
          </select>
        </div>
        <div className="action-row">
          <button className="form-button compact" type="submit">{editingId ? "Save changes" : "Add staff"}</button>
          <button className="ghost-btn" type="button" onClick={resetForm}>Cancel</button>
        </div>
      </form>

      {loading ? (
        <div>Loading staff...</div>
      ) : (
        <div className="cards-grid">
          {staff.map((member) => (
            <div key={member.id} className="card-tile">
              <div className="card-top-row">
                <h5>{member.name}</h5>
                <span className="status-pill">{member.status}</span>
              </div>
              <p>{member.role}</p>
              <span>{member.shift}</span>
              <div className="action-row">
                <button className="ghost-btn" type="button" onClick={() => handleEdit(member)}>Edit</button>
                <button className="ghost-btn" type="button" onClick={() => handleDelete(member.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default Staff;
