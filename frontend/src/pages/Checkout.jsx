import { useState } from "react";
import { createBooking, updateBooking } from "../api/salonApi";
import { getActiveSalon } from "../utils/salonData";
import { useToast } from "../context/ToastContext";

const defaultTryOn = {
  style: "Mullet",
  displayStyle: "Mullet (AI - Oval, Warm)",
  price: 449,
  originalPrice: 499,
  advance: 49,
  stylist: "Aman 4.9★",
  userPhoto: "",
};

function getTryOnBooking() {
  try {
    return JSON.parse(localStorage.getItem("glow_last_tryon") || localStorage.getItem("glow_last_tryon_booking") || "null") || defaultTryOn;
  } catch {
    return defaultTryOn;
  }
}

function Checkout() {
  const { showToast } = useToast();
  const [booking] = useState(() => getTryOnBooking());
  const [name, setName] = useState("Test User");
  const [phone, setPhone] = useState("9999999999");
  const [message, setMessage] = useState("");
  const [opening, setOpening] = useState(false);
  const styleName = booking.style || booking.styleName || "Mullet";
  const fullPrice = Number(booking.price || 449);
  const originalPrice = Number(booking.originalPrice || 499);
  const advance = 49;
  const remaining = fullPrice - advance;

  const openRazorpay = (amount, description) => {
    if (!window.Razorpay) {
      setMessage("Razorpay load nahi hua. Please refresh karke try karein.");
      return;
    }

    setOpening(true);
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: amount * 100,
      currency: "INR",
      name: "Glow Studio",
      description,
      image: "/logo.png",
      handler: async (response) => {
        console.log("Payment ID", response.razorpay_payment_id);
        const salon = getActiveSalon();
        const confirmedBooking = {
          ...booking,
          id: booking.id || Date.now(),
          style: styleName,
          service: styleName,
          price: fullPrice,
          finalPrice: fullPrice,
          advance: amount === advance ? advance : fullPrice,
          paymentId: response.razorpay_payment_id,
          status: "Confirmed",
          paymentStatus: "Paid",
          date: booking.date || "Tomorrow",
          time: booking.time || "",
          createdAt: booking.createdAt || new Date().toISOString(),
          stylist: booking.stylist || "Aman 4.9★",
          client: name,
          phone,
          userPhoto: booking.userPhoto || "",
          styleImage: booking.styleImage || "",
          hdUnlocked: true,
          source: "AI Try-On",
          leadTag: "AI Try-On Lead",
          tag: "AI Try-On",
          match: "95%",
          remaining: amount === advance ? remaining : 0,
          displayStyle: booking.displayStyle || `${styleName} (AI - Oval, Warm)`,
          salonId: salon?.id || booking.salonId,
          salonName: salon?.name || booking.salonName,
        };

        try {
          if (booking.id) {
            await updateBooking(booking.id, confirmedBooking);
          } else {
            await createBooking({ ...confirmedBooking, paymentStatus: "Paid" });
          }
        } catch (error) {
          console.error("Failed to sync paid booking", error);
          showToast("Payment done, but server sync failed. Admin se confirm karwa lein.", "error");
        }

        localStorage.setItem("glow_last_tryon_booking", JSON.stringify(confirmedBooking));
        localStorage.setItem("glow_payment_id", response.razorpay_payment_id);
        showToast("Payment successful! Booking confirmed.");
        window.location.href = "/my-bookings?payment=success";
      },
      prefill: { name, contact: phone, email: "test@test.com" },
      notes: { style: styleName, source: "AI Try-On" },
      theme: { color: "#a855f7" },
      modal: { ondismiss: () => setOpening(false) },
    };
    const razorpay = new window.Razorpay(options);
    razorpay.on("payment.failed", () => {
      setOpening(false);
      setMessage("Payment failed. Test Mode mein success@razorpay use karein.");
    });
    razorpay.open();
  };

  return (
    <main className="checkout-page">
      <section className="checkout-header">
        <div><p className="eyebrow">Glow Studio AI Try-On</p><h3>Complete your booking</h3><p>Unlock your HD look with a secure Razorpay Test Mode payment.</p></div>
        <span className="ai-try-on-badge">TEST MODE</span>
      </section>
      <div className="checkout-grid">
        <section className="checkout-card checkout-summary">
          <p className="eyebrow">Your selected look</p>
          <h4>{styleName} <span>(AI 95% Match)</span></h4>
          {booking.userPhoto && <img className="checkout-photo" src={booking.userPhoto} alt="Selected try-on look" />}
          <div className="checkout-line"><span>Original price</span><del>₹{originalPrice}</del></div>
          <div className="checkout-line"><span>Discount</span><strong className="checkout-discount">-₹{originalPrice - fullPrice}</strong></div>
          <div className="checkout-line checkout-total"><span>Total</span><strong>₹{fullPrice}</strong></div>
          <div className="checkout-highlight"><span>Now Paying Advance</span><strong>₹{advance}</strong></div>
          <div className="checkout-line"><span>Remaining at Salon</span><strong>₹{remaining}</strong></div>
        </section>
        <section className="checkout-card checkout-payment">
          <p className="eyebrow">Secure payment</p>
          <h4>Unlock HD Look</h4>
          <label>Name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" /></label>
          <label>Phone<input value={phone} onChange={(event) => setPhone(event.target.value)} inputMode="numeric" maxLength="10" placeholder="9999999999" /></label>
          <button className="form-button checkout-primary" type="button" disabled={opening} onClick={() => openRazorpay(advance, `${styleName} - AI Try-On Advance`)}>Pay ₹49 Advance &amp; Unlock HD</button>
          <button className="checkout-full-button" type="button" disabled={opening} onClick={() => openRazorpay(fullPrice, `${styleName} - AI Try-On Full Payment`)}>Pay Full ₹{fullPrice}</button>
          <p className="checkout-secure">Secure by Razorpay Test Mode<br /><strong>Use UPI success@razorpay</strong></p>
          {message && <p className="ai-try-on-message">{message}</p>}
        </section>
      </div>
    </main>
  );
}

export default Checkout;
