import { useEffect, useMemo, useState } from "react";
import { getBookings, getSlots, getStaff } from "../../api/salonApi";

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
  const [staff, setStaff] = useState([]);
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

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

    fetchDashboardData();
    const refreshTimer = window.setInterval(fetchDashboardData, 5000);
    const syncLocalData = () => setBookings((current) => mergeBookings(current));
    const refreshOnFocus = () => {
      if (document.visibilityState === "visible") {
        syncLocalData();
      }
    };
    window.addEventListener("storage", syncLocalData);
    document.addEventListener("visibilitychange", refreshOnFocus);
    return () => {
      active = false;
      window.clearInterval(refreshTimer);
      window.removeEventListener("storage", syncLocalData);
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

  return (
    <div className="page-stack">
      <section className="hero-panel"><div><p className="eyebrow">Admin overview</p><h3>Your salon is running smoothly.</h3><p>Monitor staff, services, slots, and bookings from one screen.</p></div><div className="hero-chip">Today • {metrics.todaysBookings.length} appointments</div></section>
      <section className="stats-grid">{cards.map((card) => <div key={card.label} className="info-card"><p>{card.label}</p><h4>{card.value}</h4><span>{card.detail}</span></div>)}</section>
      <section className="panel-card"><div className="panel-header"><h4>Weekly demand</h4><span className="topbar-pill">Live salon activity</span></div>{loading ? <div>Loading metrics...</div> : <div className="chart-bars">{metrics.demand.map((item) => <div key={item.day} className="chart-column"><div className="bar-track"><div className="bar-fill" style={{ height: `${item.value ? Math.max(28, (item.value / metrics.maxDemand) * 100) : 0}%` }} /></div><span>{item.day}</span></div>)}</div>}</section>
    </div>
  );
}

export default AdminDashboard;