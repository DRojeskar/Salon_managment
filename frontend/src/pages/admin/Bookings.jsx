import { useEffect, useState } from "react";
import { getBookings, updateBooking } from "../../api/salonApi";

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

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

  return (
    <section className="panel-card">
      <div className="panel-header">
        <h4>Customer bookings</h4>
        <span className="topbar-pill">{bookings.length} requests</span>
      </div>

      {loading ? <div>Loading bookings...</div> : bookings.length === 0 ? <div>No customer bookings yet.</div> : (
        <div className="list-stack">
          {bookings.map((booking) => (
            <div key={booking.id} className="list-item">
              <div>
                <strong>{booking.client}</strong>
                <p>{booking.service} {booking.staff ? `with ${booking.staff}` : ""}</p>
                <small>{booking.date} {booking.source === "ai_style_studio" ? "• AI Style Studio" : "• Normal booking"}</small>
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
    </section>
  );
}

export default Bookings;
