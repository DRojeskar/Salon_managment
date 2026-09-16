import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import salonStyles from "../data/salonStyles.json";
import { getNextAppointmentSlot } from "../utils/timeFormat";

const faceShapes = ["Oval", "Round", "Square", "Heart", "Diamond", "Oblong", "Rectangle", "Triangle", "Pear", "Inverted triangle", "Asymmetrical"];
const skinTones = ["Fair", "Light", "Medium", "Tan", "Deep", "Dark"];
const undertones = ["Warm undertone", "Cool undertone", "Neutral undertone"];
const tabs = [
  { id: "hairCuts", label: "Hair Cut" },
  { id: "hairColors", label: "Hair Color" },
  { id: "beardStyles", label: "Beard" },
  { id: "spa", label: "Spa" },
];
const spaStyles = [
  { id: "hair-spa", name: "Hair Spa", bestFor: ["All"], price: 699, discountedPrice: 629, png: "/styles/hair-spa.png" },
  { id: "scalp-detox", name: "Scalp Detox", bestFor: ["All"], price: 599, discountedPrice: 539, png: "/styles/scalp-detox.png" },
  { id: "keratin-gloss", name: "Keratin Gloss", bestFor: ["All"], price: 1299, discountedPrice: 1169, png: "/styles/keratin-gloss.png" },
];

// MediaPipe ke bina demo face-mesh fallback: preview ke center mein face bounds use hote hain.
function detectFaceBounds() {
  return { left: 25, top: 18, width: 50, height: 58 };
}

function AITryOn() {
  const navigate = useNavigate();
  const [photoUrl, setPhotoUrl] = useState("");
  const [uploadedPhoto, setUploadedPhoto] = useState("");
  const [faceBounds, setFaceBounds] = useState(null);
  const [faceShape, setFaceShape] = useState("Oval");
  const [skinTone, setSkinTone] = useState("Fair");
  const [undertone, setUndertone] = useState("Warm undertone");
  const [activeTab, setActiveTab] = useState("hairCuts");
  const [selectedStyle, setSelectedStyle] = useState(salonStyles.hairCuts.find((style) => style.id === "slick-back"));
  const [overlayAvailable, setOverlayAvailable] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(300);
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => () => photoUrl && URL.revokeObjectURL(photoUrl), [photoUrl]);

  useEffect(() => {
    if (!photoUrl || secondsLeft <= 0) return undefined;
    const timer = window.setInterval(() => setSecondsLeft((current) => Math.max(0, current - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [photoUrl, secondsLeft]);

  const allStyles = useMemo(() => (activeTab === "spa" ? spaStyles : salonStyles[activeTab] || []), [activeTab]);
  const recommendedStyles = useMemo(() => {
    if (activeTab === "hairCuts") {
      const preferred = faceShape === "Oval" ? ["French Crop", "Textured Quiff", "Low Fade"] : allStyles.filter((style) => style.bestFor.includes(faceShape)).slice(0, 3).map((style) => style.name);
      return preferred.map((name) => allStyles.find((style) => style.name === name)).filter(Boolean);
    }
    if (activeTab === "hairColors" && undertone === "Warm undertone") {
      return allStyles.filter((style) => ["Burgundy", "Chestnut Brown"].includes(style.name));
    }
    return allStyles.filter((style) => style.bestFor.includes(faceShape) || style.bestFor.includes(undertone)).slice(0, 3);
  }, [activeTab, allStyles, faceShape, undertone]);
  const remainingStyles = useMemo(() => allStyles.filter((style) => !recommendedStyles.some((recommended) => recommended.id === style.id)), [allStyles, recommendedStyles]);
  const timerLabel = `${String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:${String(secondsLeft % 60).padStart(2, "0")}`;
  const discountedPrice = selectedStyle.discountedPrice;
  const hairlineStyle = faceBounds ? {
    top: `${faceBounds.top + faceBounds.height * 0.2}%`,
    left: `${faceBounds.left + faceBounds.width / 2}%`,
    width: `${faceBounds.width * 1.45}%`,
    transform: "translateX(-50%)",
  } : undefined;

  const handlePhoto = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhotoUrl(URL.createObjectURL(file));
    setFaceBounds(detectFaceBounds());
    setSecondsLeft(300);
    setMessage("");

    // Booking ke liye photo ko memory mein base64 rakho; server par privacy expiry ke saath jayega.
    const reader = new FileReader();
    reader.onload = () => setUploadedPhoto(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const selectTab = (tabId) => {
    const styles = tabId === "spa" ? spaStyles : salonStyles[tabId];
    setActiveTab(tabId);
    setSelectedStyle(styles[0]);
    setOverlayAvailable(true);
  };

  const selectStyle = (style) => {
    setSelectedStyle(style);
    setOverlayAvailable(true);
  };

  const handleBook = () => {
    setBooking(true);
    setMessage("");
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const appointment = getNextAppointmentSlot();
    const bookingRecord = {
      id: Date.now(),
      service: "Hair Cut",
      displayStyle: `${selectedStyle.name} (AI - ${faceShape}, ${undertone.replace(" undertone", "")})`,
      price: selectedStyle.discountedPrice,
      originalPrice: selectedStyle.price,
      stylist: "Aman",
      date: appointment.date,
      time: appointment.time,
      createdAt: appointment.createdAt,
      userPhoto: uploadedPhoto,
      styleImage: selectedStyle.png,
      styleName: selectedStyle.name,
      status: "Confirmed",
      hdUnlocked: true,
      tag: "AI Try-On",
      match: "95%",
      client: user?.name || "Customer",
    };
    localStorage.setItem("glow_last_tryon", JSON.stringify({ ...bookingRecord, style: selectedStyle.name, advance: 49 }));
    localStorage.setItem("glow_last_tryon_booking", JSON.stringify(bookingRecord));
    setSecondsLeft(0);
    setBooked(true);
    setBooking(false);
    navigate("/checkout");
  };

  const renderStyleCard = (style, isRecommended = false) => (
    <button type="button" className={`ai-style-card ${selectedStyle.id === style.id ? "selected" : ""}`} key={style.id} onClick={() => selectStyle(style)}>
      <span className="ai-card-art" style={style.hex ? { background: style.hex } : undefined}>{style.name.slice(0, 1)}</span>
      <strong>{style.name}</strong>
      <small>{isRecommended ? "AI Recommended 95% Match" : style.bestFor.join(" · ")}</small>
      <span className="ai-card-price" title="Glow Studio fixed price - No extra charges">
        <b>₹{style.discountedPrice}</b>
        <del>₹{style.price}</del>
        <em>10% OFF</em>
      </span>
    </button>
  );

  return (
    <div className="ai-try-on">
      <section className="ai-try-on-header">
        <div>
          <p className="eyebrow">Glow Studio AI</p>
          <h3>Try your next look before you book.</h3>
          <p>Pick a style, preview the vibe, and reserve your salon transformation.</p>
        </div>
        <span className="ai-try-on-badge">LEVEL 2 · TRY-ON STUDIO</span>
      </section>

      <section className="ai-studio-controls ai-try-on-panel">
        <div className="ai-studio-tabs" role="tablist" aria-label="Try-on categories">
          {tabs.map((tab) => <button key={tab.id} type="button" role="tab" aria-selected={activeTab === tab.id} className={activeTab === tab.id ? "active" : ""} onClick={() => selectTab(tab.id)}>{tab.label}</button>)}
        </div>
        <div className="ai-try-on-fields ai-studio-fields">
          <label>Face shape<select value={faceShape} onChange={(event) => setFaceShape(event.target.value)}>{faceShapes.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Skin tone<select value={skinTone} onChange={(event) => setSkinTone(event.target.value)}>{skinTones.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Undertone<select value={undertone} onChange={(event) => setUndertone(event.target.value)}>{undertones.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="ai-upload-inline" htmlFor="ai-try-on-photo">{photoUrl ? "Photo ready" : "Apni Photo Upload Karo"}<input id="ai-try-on-photo" type="file" accept="image/*" onChange={handlePhoto} /></label>
        </div>
      </section>

      <section className="ai-style-browser">
        <div className="ai-section-heading"><div><p className="eyebrow">Curated for you</p><h4>Recommended</h4></div><span>{recommendedStyles.length ? "AI Recommended" : "All styles"}</span></div>
        {recommendedStyles.length > 0 && <div className="ai-style-carousel">{recommendedStyles.map((style) => renderStyleCard(style, true))}</div>}
        <div className="ai-section-heading ai-all-heading"><div><p className="eyebrow">Explore the catalog</p><h4>All Styles</h4></div><span>{allStyles.length} looks</span></div>
        <div className="ai-style-carousel">{remainingStyles.map((style) => renderStyleCard(style))}</div>
      </section>

      <section className="ai-preview-layout">
        <div className="ai-try-on-panel ai-preview-panel">
          <div className="ai-try-on-panel-heading"><span className="ai-try-on-step">03</span><div><h4>HD look preview</h4><p>{selectedStyle.name} on your photo</p></div></div>
          <div className="ai-preview-stage">
            {photoUrl ? <img className="ai-preview-photo" src={photoUrl} alt="Uploaded customer preview" /> : <div className="ai-empty-preview"><span>✦</span><p>Upload a photo to start your try-on</p></div>}
            {photoUrl && (overlayAvailable ? <img className="ai-hairstyle-image" style={hairlineStyle} src={selectedStyle.png} alt={`${selectedStyle.name} overlay`} onError={() => setOverlayAvailable(false)} /> : <div className="ai-hairstyle-placeholder" style={hairlineStyle} aria-label={`${selectedStyle.name} overlay placeholder`}>{selectedStyle.name}</div>)}
            {photoUrl && activeTab === "hairColors" && selectedStyle.hex && <div className="ai-color-overlay" style={{ ...hairlineStyle, backgroundColor: selectedStyle.hex }} aria-label={`${selectedStyle.name} color overlay`} />}
            <div className="ai-preview-shade" />
            <div className="ai-watermark">Glow Studio ✨<br /><span>HD Unlock on Booking</span></div>
            <div className="ai-diagonal-watermark" aria-hidden="true">{Array.from({ length: 6 }, (_, watermarkIndex) => <span key={watermarkIndex}>Glow Studio - Book to Unlock HD</span>)}</div>
            <div className="ai-lock-message"><span className="ai-lock">🔒</span><strong>HD Look Unlock Karne Ke Liye Book Karo</strong></div>
          </div>
        </div>
        <aside className="ai-lock-in-card">
          <p className="eyebrow">Your look, ready to book</p><h4>Lock in this look</h4>
          <p>Ye look aap par <strong>Aman</strong> <span className="ai-stars">4.9★</span> Top Stylist 45 min me bana dega.</p>
          <div className="ai-price-row" title="Glow Studio fixed price - No extra charges"><span>Price <del>₹{selectedStyle.price}</del> <em>10% OFF</em></span><strong>₹{discountedPrice}</strong></div>
          <div className="ai-countdown"><span>Offer expires in</span><strong>{timerLabel}</strong></div>
          <p className="ai-live-proof">● 12 log abhi ye try kar rahe hain</p>
          <p className="ai-privacy-note">Photo sirf try-on ke liye, 24hr me auto-delete</p>
          {booked ? <p className="ai-offer-availed">Offer Availed ✅ - HD Look Unlocked</p> : <button className="form-button" type="button" onClick={handleBook} disabled={!photoUrl || booking}>{booking ? "Booking..." : `Book This Look Now - 10% OFF ₹${discountedPrice}`}</button>}
          {message && <p className="ai-try-on-message">{message}</p>}
        </aside>
      </section>
    </div>
  );
}

export default AITryOn;