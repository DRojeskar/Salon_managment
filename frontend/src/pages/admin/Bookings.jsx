import { useEffect, useMemo, useState } from "react";
import { getBookings, updateBooking } from "../../api/salonApi";
import { formatTime, formatBookingDate } from "../../utils/timeFormat";

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [tryOnBooking, setTryOnBooking] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("glow_last_tryon_booking") || "null");
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [tryOnOverlayError, setTryOnOverlayError] = useState(false);
  const [filter, setFilter] = useState("all");
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState("");

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await getBookings();
      setBookings(response.data.bookings || []);
    } catch (error) {
      console.error("Failed to load bookings", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    const syncTryOnBooking = () => {
      try {
        setTryOnBooking(JSON.parse(localStorage.getItem("glow_last_tryon_booking") || "null"));
      } catch {
        setTryOnBooking(null);
      }
    };
    window.addEventListener("storage", syncTryOnBooking);
    return () => window.removeEventListener("storage", syncTryOnBooking);
  }, []);

  const updateStatus = async (id, field, value) => {
    try {
      setSavingId(id);
      await updateBooking(id, { [field]: value });
      await fetchBookings();
    } catch (error) {
      console.error("Failed to update booking", error);
    } finally {
      setSavingId(null);
    }
  };

  const apiTryOnBooking = bookings.find((booking) => booking.source === "AI Try-On" || booking.leadTag === "AI Try-On Lead");
  const lead = tryOnBooking || apiTryOnBooking;
  const leadIsPaid = Boolean(lead?.hdUnlocked && lead?.paymentId) || lead?.paymentStatus === "Paid";
  const normalBookings = bookings.filter((booking) => booking.source !== "AI Try-On" && booking.leadTag !== "AI Try-On Lead");
  const paidLeadCount = bookings.filter((booking) => (booking.source === "AI Try-On" || booking.leadTag === "AI Try-On Lead") && (booking.hdUnlocked && booking.paymentId || booking.paymentStatus === "Paid")).length + (tryOnBooking && leadIsPaid && !apiTryOnBooking ? 1 : 0);
  const filteredBookings = useMemo(() => {
    if (filter === "normal") return normalBookings;
    if (filter === "ai-paid") return bookings.filter((booking) => (booking.source === "AI Try-On" || booking.leadTag === "AI Try-On Lead") && (booking.paymentStatus === "Paid" || booking.hdUnlocked && booking.paymentId));
    if (filter === "advance") return bookings.filter((booking) => (booking.source === "AI Try-On" || booking.leadTag === "AI Try-On Lead") && (booking.paymentStatus === "Paid" || booking.hdUnlocked && booking.paymentId));
    return bookings;
  }, [bookings, filter, normalBookings]);

  const copyPaymentId = async () => {
    if (!lead?.paymentId) return;
    await navigator.clipboard?.writeText(lead.paymentId);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const updateLeadLocally = (updates) => {
    if (!lead) return;
    const updated = { ...lead, ...updates };
    localStorage.setItem("glow_last_tryon_booking", JSON.stringify(updated));
    const stored = JSON.parse(localStorage.getItem("glow_bookings") || "[]");
    const hasStoredLead = stored.some((booking) => booking.paymentId === updated.paymentId || booking.id === updated.id);
    const updatedStored = hasStoredLead
      ? stored.map((booking) => (booking.paymentId === updated.paymentId || booking.id === updated.id ? updated : booking))
      : [updated, ...stored];
    localStorage.setItem("glow_bookings", JSON.stringify(updatedStored));
    setTryOnBooking(updated);
  };

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3500);
  };

  const handleConfirm = async (bookingId, paymentId) => {
    const confirmedAt = new Date().toISOString();
    setBookings((previous) => previous.map((booking) => (booking.paymentId === paymentId ? { ...booking, status: "Confirmed", confirmedAt } : booking)));
    updateLeadLocally({ status: "Confirmed", confirmedAt });
    if (bookingId && !tryOnBooking) {
      try {
        await updateBooking(bookingId, { status: "Confirmed", confirmedAt });
      } catch (error) {
        console.error("Failed to confirm booking in API", error);
      }
    }
    showToast(`Booking Confirmed! ₹49 Paid - ${paymentId || "AI Try-On"} - Customer ko WhatsApp sent!`);
    console.log("Confirmed:", paymentId);
  };

  const handleComplete = (paymentId) => {
    const updated = { status: "Completed", remainingCollected: true, completedAt: new Date().toISOString() };
    setBookings((previous) => previous.map((booking) => (booking.paymentId === paymentId ? { ...booking, ...updated } : booking)));
    updateLeadLocally(updated);
    showToast(`Collected Remaining ₹${lead?.remaining ?? 355}! Booking Completed - Total ₹${lead?.price ?? 404} received`);
  };

  return (
    <section className="panel-card">
      <div className="panel-header">
        <h4>Customer bookings</h4>
        <span className="topbar-pill">{bookings.length} requests</span>
      </div>

      <div className="booking-filters" role="group" aria-label="Booking filters">
        <button type="button" className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>All {bookings.length + (tryOnBooking && !apiTryOnBooking ? 1 : 0)}</button>
        <button type="button" className={filter === "ai-paid" ? "active" : ""} onClick={() => setFilter("ai-paid")}>AI Paid Leads {paidLeadCount}</button>
        <button type="button" className={filter === "normal" ? "active" : ""} onClick={() => setFilter("normal")}>Normal Bookings {normalBookings.length}</button>
        <button type="button" className={filter === "advance" ? "active" : ""} onClick={() => setFilter("advance")}>Advance Paid {paidLeadCount}</button>
      </div>

      {lead && filter !== "normal" && <article className={`admin-tryon-lead ${leadIsPaid ? "paid" : "pending"}`}>
        <div className="admin-tryon-photo">
          {lead.userPhoto && <img src={lead.userPhoto} alt={`${lead.styleName || lead.style} customer preview`} />}
          {typeof lead.styleImage === "string" && lead.styleImage.trim() && lead.styleImage !== "undefined" && !tryOnOverlayError && <img className="admin-tryon-overlay" src={lead.styleImage} alt={`${lead.styleName || lead.style} overlay`} onError={() => setTryOnOverlayError(true)} />}
        </div>
        <div>
          <span className={`ai-lead-tag ${leadIsPaid ? "paid" : "pending"}`}>{leadIsPaid ? "🔥 AI Try-On Lead • ₹49 ADVANCE PAID ✅" : "🔥 AI Try-On Lead • Payment Pending - HD Locked"}</span>
          <h4>{lead.displayStyle || `${lead.styleName || lead.style} (AI - ${lead.faceShape || "Oval"}, ${lead.undertone || "Warm"})`} with {lead.stylist || "Aman"} • {lead.date} at {formatTime(lead.time)}</h4>
          <p className={`admin-payment-line ${leadIsPaid ? "paid" : "pending"}`}>{leadIsPaid ? <>Advance Paid: ₹{lead.advance || 49} - Payment ID: {lead.paymentId} <button type="button" onClick={copyPaymentId} title="Copy payment ID">{copied ? "✓" : "⧉"}</button> - Remaining: ₹{lead.remaining ?? Math.max(0, Number(lead.price || 449) - Number(lead.advance || 49))} at Salon - HD Unlocked for Customer ✅</> : "Payment Pending - HD Locked"}</p>
          <p>Customer: {lead.client || "Customer"} | Phone: {lead.phone || lead.contact || "Not provided"} | Face Shape: {lead.faceShape || "Oval"} | Offer: 10% OFF Availed</p>
          <div className="admin-lead-actions"><button className="form-button compact" type="button" disabled={lead.status === "Confirmed" || lead.status === "Completed"} onClick={() => handleConfirm(lead.id, lead.paymentId)}>{lead.status === "Confirmed" || lead.status === "Completed" ? "Confirmed ✅" : "Confirm Booking"}</button><button className="ghost-btn" type="button" disabled={lead.status === "Completed"} onClick={() => handleComplete(lead.paymentId)}>{lead.status === "Completed" ? "Completed ✅" : `Mark as Completed - Collect ₹${lead.remaining ?? 355}`}</button></div>
        </div>
      </article>}

      {loading ? <div>Loading bookings...</div> : filteredBookings.length === 0 ? <div>No bookings in this filter.</div> : (
        <div className="list-stack">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="list-item">
              <div>
                <strong>{booking.client}</strong>
                <p>{booking.service} {booking.staff ? `with ${booking.staff}` : ""}</p>
                <small>{formatBookingDate(booking.date)} {booking.source === "AI Try-On" ? "• AI Try-On" : booking.source === "ai_style_studio" ? "• AI Style Studio" : "• Normal booking"}</small>
                {booking.leadTag === "AI Try-On Lead" && <span className="ai-lead-tag">AI Try-On Lead</span>}
              </div>
              <div className="action-row">
                <select className="form-input compact-select" value={booking.status || "Pending"} disabled={savingId === booking.id} onChange={(event) => updateStatus(booking.id, "status", event.target.value)} aria-label={`Booking status for ${booking.client}`}>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <select className="form-input compact-select" value={booking.paymentStatus || "NotRequired"} disabled={savingId === booking.id} onChange={(event) => updateStatus(booking.id, "paymentStatus", event.target.value)} aria-label={`Payment status for ${booking.client}`}>
                  <option value="NotRequired">No payment</option>
                  <option value="Pending">Payment pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Failed">Failed</option>
                </select>
                <span className="status-pill">₹{Number(booking.amount || 0).toLocaleString("en-IN")}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {toast && <div className="admin-toast" role="status">{toast}</div>}
    </section>
  );
}

export default Bookings;
