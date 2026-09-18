import { useEffect, useMemo, useState } from "react";
import { getBookings, getSlots, getStaff } from "../../api/salonApi";
import { deleteSalon as deleteSalonApi } from "../../api/salonApi";
import { createSalonProfile, fetchSalonsFromApi, getActiveSalon, getSalonProfiles, setActiveSalon, writeStorageList } from "../../utils/salonData";
import { useToast } from "../../context/ToastContext";
import ConfirmDialog from "../../components/ConfirmDialog";
import { formatSalonHours } from "../../utils/timeFormat";

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function readLocalArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function getBookingDate(value) {
  const datePart = String(value || "").split("•")[0].trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    const [year, month, day] = datePart.split("-").map(Number);
    return new Date(year, month - 1, day);
  }
  const parsed = new Date(datePart);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function mergeBookings(apiBookings) {
  const localBookings = readLocalArray("glow_bookings");
  let tryOnBooking = null;
  try { tryOnBooking = JSON.parse(localStorage.getItem("glow_last_tryon_booking") || "null"); } catch { /* Ignore malformed local booking data. */ }
  const allBookings = [...apiBookings, ...localBookings, ...(tryOnBooking ? [tryOnBooking] : [])];
  return allBookings.filter((booking, index, collection) => collection.findIndex((item) => (
    (item.paymentId && item.paymentId === booking.paymentId) || String(item.id) === String(booking.id)
  )) === index);
}

function AdminDashboard() {
  const { showToast } = useToast();
  const [staff, setStaff] = useState([]);
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salons, setSalons] = useState(getSalonProfiles());
  const [platformScope, setPlatformScope] = useState("");
  const [salonPendingDelete, setSalonPendingDelete] = useState(null);
  const [salonForm, setSalonForm] = useState({
    name: "",
    phone: "",
    address: "",
    openTime: "09:00",
    closeTime: "21:00",
  });
  const activeSalon = getActiveSalon();

  useEffect(() => {
    let active = true;
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [staffResponse, slotsResponse, bookingsResponse] = await Promise.all([
          getStaff(), getSlots(), getBookings(),
        ]);
        if (!active) return;
        setStaff(staffResponse.data.staff || []);
        setSlots(slotsResponse.data.slots || []);
        setBookings(mergeBookings(bookingsResponse.data.bookings || []));
      } catch (error) {
        if (!active) return;
        setStaff(readLocalArray("glow_staff"));
        setBookings(mergeBookings([]));
        console.error("Failed to load admin dashboard data", error);
      } finally {
        if (active) setLoading(false);
      }
    };

    const loadSalons = async () => {
      try {
        const { salons: nextSalons, scope } = await fetchSalonsFromApi();
        setSalons(nextSalons);
        setPlatformScope(scope);
      } catch (error) {
        setSalons(getSalonProfiles());
      }
    };

    loadSalons();
    fetchDashboardData();
    const refreshTimer = window.setInterval(fetchDashboardData, 5000);
    const syncLocalData = () => {
      loadSalons();
      setBookings((current) => mergeBookings(current));
    };
    const refreshOnFocus = () => {
      if (document.visibilityState === "visible") {
        syncLocalData();
      }
    };
    window.addEventListener("storage", syncLocalData);
    window.addEventListener("salon-changed", syncLocalData);
    document.addEventListener("visibilitychange", refreshOnFocus);
    return () => {
      active = false;
      window.clearInterval(refreshTimer);
      window.removeEventListener("storage", syncLocalData);
      window.removeEventListener("salon-changed", syncLocalData);
      document.removeEventListener("visibilitychange", refreshOnFocus);
    };
  }, []);

  const metrics = useMemo(() => {
    const today = new Date();
    const todayKey = today.toDateString();
    const todaysBookings = bookings.filter((booking) => getBookingDate(booking.date)?.toDateString() === todayKey);
    const availableStaff = staff.filter((member) => ["available", "on duty"].includes(String(member.status || "").toLowerCase())).length || (staff.length ? 0 : 3);
    const totalStaff = staff.length || 3;
    const pendingToday = todaysBookings.filter((booking) => String(booking.status || "").toLowerCase() !== "confirmed" || String(booking.paymentStatus || "").toLowerCase() !== "paid" || String(booking.status || "").toLowerCase() === "pending").length;
    const todayRevenue = todaysBookings.filter((booking) => String(booking.paymentStatus || "").toLowerCase() === "paid").reduce((sum, booking) => sum + Number(booking.price || booking.amount || 0), 0);
    const openSlots = slots.filter((slot) => String(slot.status || "").toLowerCase() === "open").length;
    const demand = weekDays.map((day, index) => ({ day, value: bookings.filter((booking) => getBookingDate(booking.date)?.getDay() === index + 1).length }));
    const maxDemand = Math.max(...demand.map((item) => item.value), 1);
    return { todaysBookings, availableStaff, totalStaff, pendingToday, todayRevenue, openSlots, demand, maxDemand };
  }, [bookings, slots, staff]);

  const cards = [
    { label: "Staff on duty", value: `${metrics.availableStaff} / ${metrics.totalStaff}`, detail: "available" },
    { label: "Today's bookings", value: String(metrics.todaysBookings.length), detail: `${metrics.pendingToday} pending` },
    { label: "Open slots", value: String(metrics.openSlots), detail: "Peak evening" },
    { label: "Revenue", value: `₹${metrics.todayRevenue.toLocaleString("en-IN")}`, detail: "+0% week" },
  ];

  const handleSalonSubmit = async (event) => {
    event.preventDefault();
    if (!salonForm.name.trim()) {
      showToast("Salon name is required.", "error");
      return;
    }

    try {
      const created = await createSalonProfile(salonForm);
      await setActiveSalon(created.id);
      const { salons: nextSalons, scope } = await fetchSalonsFromApi();
      setSalons(nextSalons);
      setPlatformScope(scope);
      setSalonForm({ name: "", phone: "", address: "", openTime: "09:00", closeTime: "21:00" });
      showToast("Salon added successfully.");
      window.dispatchEvent(new Event("salon-changed"));
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to add salon", "error");
    }
  };

  const handleSelectSalon = async (salonId) => {
    await setActiveSalon(salonId);
    setSalons(getSalonProfiles());
    showToast("Active salon updated.", "info");
  };

  const handleDeleteSalon = (salon) => {
    if (!salon?.id) {
      showToast("Salon id missing hai. Page refresh karke dubara try karein.", "error");
      return;
    }
    setSalonPendingDelete(salon);
  };

  const confirmDeleteSalon = async () => {
    if (!salonPendingDelete) return;

    try {
      const response = await deleteSalonApi(salonPendingDelete.id);
      if (response.data.activeSalonId) {
        localStorage.setItem("glow_active_salon_id", String(response.data.activeSalonId));
      }
      const { salons: nextSalons, scope } = await fetchSalonsFromApi();
      setSalons(nextSalons);
      setPlatformScope(scope);
      window.dispatchEvent(new Event("salon-changed"));
      showToast("Salon profile deleted.");
    } catch (error) {
      const message = error.response?.data?.message || "Salon delete failed";
      if (error.response?.status === 404 && salonPendingDelete?.id) {
        const remaining = getSalonProfiles().filter((item) => String(item.id) !== String(salonPendingDelete.id));
        writeStorageList("glow_salons_cache", remaining);
        setSalons(remaining);
        window.dispatchEvent(new Event("salon-changed"));
        showToast("Ye salon sirf local cache me tha — list se hata diya. Naya salon API se add karein.", "info");
      } else {
        showToast(message, "error");
      }
    } finally {
      setSalonPendingDelete(null);
    }
  };

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Admin overview</p>
          <h3>{activeSalon?.name || "Your salon"} is running smoothly.</h3>
          <p>{activeSalon?.address || "Add salon details to manage location and timings."} • {formatSalonHours(activeSalon?.openTime, activeSalon?.closeTime)}</p>
        </div>
        <div className="hero-chip">Today • {metrics.todaysBookings.length} appointments</div>
      </section>

      <section className="panel-card">
        <div className="panel-header">
          <h4>Salon profiles (SaaS tenants)</h4>
          <span className="topbar-pill">{salons.length} salon(s){platformScope ? ` • ${platformScope}` : ""}</span>
        </div>

        <form className="inline-form" onSubmit={handleSalonSubmit}>
          <div className="form-row">
            <input className="form-input" placeholder="Salon name" value={salonForm.name} onChange={(event) => setSalonForm((current) => ({ ...current, name: event.target.value }))} required />
            <input className="form-input" placeholder="Salon phone" value={salonForm.phone} onChange={(event) => setSalonForm((current) => ({ ...current, phone: event.target.value }))} required />
          </div>
          <div className="form-row">
            <textarea className="form-input" rows="3" placeholder="Salon address" value={salonForm.address} onChange={(event) => setSalonForm((current) => ({ ...current, address: event.target.value }))} required />
          </div>
          <div className="form-row">
            <input className="form-input" type="time" value={salonForm.openTime} onChange={(event) => setSalonForm((current) => ({ ...current, openTime: event.target.value }))} required />
            <input className="form-input" type="time" value={salonForm.closeTime} onChange={(event) => setSalonForm((current) => ({ ...current, closeTime: event.target.value }))} required />
          </div>
          <div className="action-row">
            <button className="form-button compact" type="submit">Add salon</button>
          </div>
        </form>

        <div className="cards-grid">
          {salons.map((salon) => (
            <article key={salon.id} className={`card-tile ${String(salon.id) === String(activeSalon?.id) ? "selected" : ""}`}>
              <button type="button" className="card-tile-main" onClick={() => handleSelectSalon(salon.id)}>
                <div className="card-top-row">
                  <h5>{salon.name}</h5>
                  {String(salon.id) === String(activeSalon?.id) && <span className="status-pill">Active</span>}
                </div>
                <p>{salon.address}</p>
                <div className="salon-card-meta">
                  <p><span className="meta-label">Phone</span> {salon.phone || "—"}</p>
                  <p><span className="meta-label">Timings</span> {formatSalonHours(salon.openTime, salon.closeTime)}</p>
                </div>
              </button>
              <div className="action-row">
                <button type="button" className="ghost-btn salon-delete-btn" onClick={() => handleDeleteSalon(salon)}>
                  Delete profile
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="stats-grid">{cards.map((card) => <div key={card.label} className="info-card"><p>{card.label}</p><h4>{card.value}</h4><span>{card.detail}</span></div>)}</section>
      <section className="panel-card"><div className="panel-header"><h4>Weekly demand</h4><span className="topbar-pill">Live salon activity</span></div>{loading ? <div>Loading metrics...</div> : <div className="chart-bars">{metrics.demand.map((item) => <div key={item.day} className="chart-column"><div className="bar-track"><div className="bar-fill" style={{ height: `${item.value ? Math.max(28, (item.value / metrics.maxDemand) * 100) : 0}%` }} /></div><span>{item.day}</span></div>)}</div>}</section>

      <ConfirmDialog
        open={Boolean(salonPendingDelete)}
        title={`Delete "${salonPendingDelete?.name || "salon"}"?`}
        message="Is salon profile ko permanently hata diya jayega. Pending bookings hon to delete block ho jayegi. Kam se kam ek salon profile rehni chahiye."
        confirmLabel="Delete profile"
        onConfirm={confirmDeleteSalon}
        onCancel={() => setSalonPendingDelete(null)}
      />
    </div>
  );
}

export default AdminDashboard;