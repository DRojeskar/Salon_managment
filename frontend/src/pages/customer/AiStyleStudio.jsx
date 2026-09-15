import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getServices, getSlots, getStaff } from '../../api/salonApi';

const defaultForm = { faceShape: 'oval', skinTone: 'warm', service: '' };

const AI_ENDPOINT = 'http://localhost:5000/api/ai/recommendation';

function AiStyleStudio() {
  const navigate = useNavigate();
  const [form, setForm] = useState(defaultForm);
  const [photoUrl, setPhotoUrl] = useState('');
  const [result, setResult] = useState(null);
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [slots, setSlots] = useState([]);
  const [secondsLeft, setSecondsLeft] = useState(300);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getServices(), getStaff(), getSlots()])
      .then(([servicesResponse, staffResponse, slotsResponse]) => {
        const nextServices = servicesResponse.data.services || [];
        setServices(nextServices);
        setStaff(staffResponse.data.staff || []);
        setSlots(slotsResponse.data.slots || []);
        setForm((current) => ({ ...current, service: current.service || nextServices[0]?.title || '' }));
      })
      .catch(() => setError('Live salon data load nahi ho paya.'));
  }, []);

  useEffect(() => {
    if (!result || secondsLeft <= 0) return undefined;
    const timer = window.setInterval(() => setSecondsLeft((current) => Math.max(0, current - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [result, secondsLeft]);

  const selectedService = useMemo(() => services.find((service) => service.title === form.service) || services[0], [form.service, services]);
  const selectedStaff = staff.find((member) => String(member.status).toLowerCase() === 'available') || staff[0];
  const selectedSlot = slots.find((slot) => String(slot.status).toLowerCase() === 'open') || slots[0];
  const selectedSlotTime = selectedSlot?.time || selectedSlot?.startTime || selectedSlot?.start || '11:00';
  const offerPrice = Math.round(Number(selectedService?.price || 0) * 0.9);
  const timerLabel = `${String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:${String(secondsLeft % 60).padStart(2, '0')}`;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(AI_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          bookings: [], appointments: [], services, staff, slots,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Recommendation failed');
      }

      setResult(data.styleRecommendation);
      setSecondsLeft(300);
    } catch (err) {
      setError(err.message || 'Unable to generate recommendation');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoto = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhotoUrl(URL.createObjectURL(file));
    setResult(null);
    setSecondsLeft(300);
  };

  const unlockAndBook = () => {
    if (!selectedService) return;
    const date = new Date();
    date.setDate(date.getDate() + 1);
    navigate('/customer/dashboard', { state: { booking: {
      service: selectedService.title,
      staff: selectedStaff?.name || '',
      source: 'ai_style_studio',
      date: date.toISOString().slice(0, 10),
      time: selectedSlotTime,
    } } });
  };

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">AI beauty assistant</p>
          <h3>Pehle Dekho, Fir Katwao</h3>
          <p>Upload your look, scan face shape, and get salon-ready hairstyle and color suggestions.</p>
        </div>
        <div className="hero-chip">Smart try-on</div>
      </section>

      <div className="ai-grid">
        <section className="ai-card">
          <h4>Face + skin analysis</h4>
          <form className="ai-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="style-photo">Your photo</label>
              <input id="style-photo" className="form-input" type="file" accept="image/*" onChange={handlePhoto} required />
            </div>
            <div className="form-row">
              <div className="input-group">
                <label htmlFor="faceShape">Face shape</label>
                <select id="faceShape" className="form-input" value={form.faceShape} onChange={(e) => setForm({ ...form, faceShape: e.target.value })}>
                  <option value="oval">Oval</option>
                  <option value="round">Round</option>
                  <option value="square">Square</option>
                  <option value="heart">Heart</option>
                  <option value="diamond">Diamond</option>
                  <option value="oblong">Oblong</option>
                  <option value="rectangle">Rectangle</option>
                  <option value="triangle">Triangle</option>
                  <option value="pear">Pear</option>
                  <option value="invertedTriangle">Inverted triangle</option>
                  <option value="asymmetrical">Asymmetrical</option>
                </select>
              </div>

              <div className="input-group">
                <label htmlFor="skinTone">Skin tone</label>
                <select id="skinTone" className="form-input" value={form.skinTone} onChange={(e) => setForm({ ...form, skinTone: e.target.value })}>
                  <option value="fair">Fair</option>
                  <option value="light">Light</option>
                  <option value="medium">Medium</option>
                  <option value="tan">Tan</option>
                  <option value="deep">Deep</option>
                  <option value="dark">Dark</option>
                  <option value="warm">Warm undertone</option>
                  <option value="cool">Cool undertone</option>
                  <option value="neutral">Neutral undertone</option>
                </select>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="service">Preferred service</label>
              <select id="service" className="form-input" value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })}>
                {services.map((service) => <option key={service.id} value={service.title}>{service.title}</option>)}
              </select>
            </div>

            <div className="ai-actions">
              <button type="submit" className="form-button compact" disabled={loading}>
                {loading ? 'Analyzing...' : 'Get AI recommendation'}
              </button>
            </div>
          </form>

          {error && <p style={{ color: '#fca5a5', marginTop: '12px' }}>{error}</p>}
        </section>

        <section className="ai-card">
          <h4>HD look preview</h4>
          {photoUrl ? <div className="locked-try-on"><img src={photoUrl} alt="Uploaded customer preview" /><div className="locked-overlay"><span className="lock-icon">🔒</span><strong>Glow Studio ✨ - HD Unlock on Booking</strong><small>HD preview locked</small></div></div> : <p>Photo upload karne ke baad locked teaser yahan dikhega.</p>}
        </section>
      </div>

      {result && <section className="ai-card personalization-card">
        <p className="eyebrow">Personalized match</p>
        <h3>{result.hairstyle}</h3>
        <p><strong>Face analysis:</strong> {form.faceShape} shape</p>
        <p><strong>Match:</strong> {result.confidence} confidence for {result.color}</p>
        <div className="look-offer-grid"><div><strong>{selectedService?.title}</strong><span>{selectedStaff?.name || 'Available stylist'} • {selectedService?.duration || '--'} min</span><strong>₹{Number(selectedService?.price || 0).toLocaleString('en-IN')}</strong></div><div><strong>Offer: {timerLabel}</strong><span>Limited 10% booking offer</span><strong>Unlock price: ₹{offerPrice.toLocaleString('en-IN')}</strong></div></div>
        <p className="social-proof">{Math.max(3, services.length * 2)} people are exploring looks today.</p>
        <button className="form-button" type="button" onClick={unlockAndBook} disabled={!selectedService}>Unlock HD Look + Book Now ₹{offerPrice.toLocaleString('en-IN')}</button>
      </section>}
    </div>
  );
}

export default AiStyleStudio;
