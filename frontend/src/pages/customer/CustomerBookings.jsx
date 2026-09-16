import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { deleteBooking, getBookings } from "../../api/salonApi";
import { formatTime } from "../../utils/timeFormat";

function CustomerBookings() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [bookings, setBookings] = useState([]);
  const [tryOnBooking, setTryOnBooking] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("glow_last_tryon_booking") || "null");
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [overlayError, setOverlayError] = useState(false);
  const paymentSuccess = searchParams.get("payment") === "success";
  const hasValidStyleImage = typeof tryOnBooking?.styleImage === "string"
    && tryOnBooking.styleImage.trim()
    && tryOnBooking.styleImage !== "undefined"
    && tryOnBooking.styleImage !== "null";

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

  const handleCancel = async (id) => {
    try {
      await deleteBooking(id);
      await fetchBookings();
    } catch (error) {
      console.error("Failed to cancel booking", error);
    }
  };

  return (
    <section className="panel-card">
      <div className="panel-header">
        <h4>My bookings</h4>
        <button className="form-button compact" type="button" onClick={() => navigate("/customer/dashboard")}>
          Book appointment
        </button>
      </div>

      {tryOnBooking && <article className="tryon-booking-card">
        <div className="tryon-booking-visual">
          {tryOnBooking.userPhoto && <img src={tryOnBooking.userPhoto} alt="Your HD try-on" />}
          {hasValidStyleImage && !overlayError && <img className="tryon-booking-style" src={tryOnBooking.styleImage} alt={`${tryOnBooking.styleName || tryOnBooking.style} overlay`} onError={() => setOverlayError(true)} />}
          {!tryOnBooking.userPhoto && <span>HD LOOK</span>}
        </div>
        <div className="tryon-booking-content">
          <span className="ai-lead-tag">AI Recommended 95% Match</span>
          <h3>HD UNLOCKED ✅ {tryOnBooking.styleName || tryOnBooking.style} - AI Try-On</h3>
          <p>{tryOnBooking.date} {tryOnBooking.time ? `at ${formatTime(tryOnBooking.time)}` : "at 11:00 AM"} - {tryOnBooking.stylist} <span className="ai-stars">4.9★ Top Stylist</span> - ₹{tryOnBooking.price} (10% OFF availed)</p>
          {paymentSuccess && <p className="checkout-payment-success">HD UNLOCKED ✅ {tryOnBooking.style || tryOnBooking.styleName} - ₹{tryOnBooking.advance || 49} Advance Paid - Payment ID: {localStorage.getItem("glow_payment_id")} - Remaining ₹{tryOnBooking.remaining ?? 400} at Salon</p>}
          <p className="ai-offer-availed">Offer Availed ✅ - HD Look Unlocked</p>
          <button className="ghost-btn" type="button" onClick={() => navigate("/customer/ai-try-on")}>Get Directions / Reschedule</button>
        </div>
      </article>}

      {loading ? (
        <div>Loading bookings...</div>
      ) : (
        <div className="list-stack">
          {bookings.map((item) => (
            <div key={item.id} className="list-item">
              <div>
                <strong>{item.service}</strong>
                <p>{item.date?.includes("•") ? item.date.split("•")[0].trim() : item.date} {item.date?.includes("•") ? `at ${formatTime(item.date.split("•").slice(1).join("•"))}` : ""}</p>
              </div>
              <div className="action-row">
                <span className="status-pill">{item.status}</span>
                <button className="ghost-btn" type="button" onClick={() => handleCancel(item.id)}>Cancel</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default CustomerBookings;
