import { useEffect, useState } from 'react';

const DASHBOARD_API = 'http://localhost:5000/api/ai/marketing-dashboard';
const CAMPAIGNS_API = 'http://localhost:5000/api/ai/campaigns';
const WHATSAPP_API = 'http://localhost:5000/api/ai/send-whatsapp';

function MarketingDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [campaigns, setCampaigns] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [dashboardRes, campaignsRes] = await Promise.all([
          fetch(DASHBOARD_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              bookings: [
                { service: 'Haircut', amount: 1200 },
                { service: 'Haircut', amount: 1350 },
                { service: 'Color', amount: 2800 },
                { service: 'Color', amount: 2600 },
                { service: 'Facial', amount: 1800 },
              ],
              customers: [
                { name: 'Aman', totalSpend: 12000 },
                { name: 'Riya', totalSpend: 18000 },
                { name: 'Aman', totalSpend: 2000 },
              ],
              trend: 'upward',
            }),
          }),
          fetch(CAMPAIGNS_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              churnedCustomers: Array.from({ length: 12 }, (_, index) => ({ name: `Customer ${index + 1}` })),
              birthdayCustomers: Array.from({ length: 3 }, (_, index) => ({ name: `Birthday ${index + 1}` })),
              theme: 'Diwali Offer Poster',
            }),
          }),
        ]);

        const dashboardData = await dashboardRes.json();
        const campaignsData = await campaignsRes.json();

        if (dashboardData.success) {
          setDashboard(dashboardData.dashboard);
        }

        if (campaignsData.success) {
          setCampaigns(campaignsData.campaigns);
        }
      } catch (error) {
        console.error('Marketing dashboard failed', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const sendCampaign = async (type) => {
    setSending(true);
    setStatus('');

    try {
      const message = type === 'churn'
        ? 'Hi {{name}}, it has been a while since your last salon visit. Your glow-up is waiting — enjoy 20% OFF on your next service. Book today!'
        : type === 'birthday'
          ? 'Happy Birthday {{name}}! Glow Studio wishes you a beautiful celebration. Your special salon treat is waiting for you this week.'
          : 'Diwali glow hai, salon ka shine bhi! ✨ Get 20% OFF on stylish hair cuts, colors, and festive grooming this week.';

      const response = await fetch(WHATSAPP_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: '+919999999999',
          message,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Campaign send failed');
      }

      setStatus(`${type === 'churn' ? '20% OFF campaign' : type === 'birthday' ? 'Birthday wish' : 'Diwali poster campaign'} queued successfully via Twilio WhatsApp.`);
    } catch (error) {
      setStatus(error.message || 'Failed to send campaign');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="panel-card"><p>Loading marketing dashboard...</p></div>;
  }

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Marketing intelligence</p>
          <h3>High-converting salon growth dashboard</h3>
          <p>AI powered profit estimates, loyal customer insights, and Instagram-ready content.</p>
        </div>
        <div className="hero-chip">Performance forecast</div>
      </section>

      <div className="ai-grid">
        <div className="ai-card">
          <h4>Profit prediction</h4>
          <p>{dashboard?.profitPrediction}</p>
        </div>

        <div className="ai-card">
          <h4>Best-selling service</h4>
          <p>{dashboard?.topService}</p>
        </div>

        <div className="ai-card">
          <h4>Loyal customer</h4>
          <p>{dashboard?.loyalCustomer}</p>
        </div>

        <div className="ai-card">
          <h4>Instagram content</h4>
          <p>{dashboard?.instagramCaption}</p>
        </div>
      </div>

      <section className="panel-card">
        <div className="panel-header">
          <h4>Marketing campaigns</h4>
        </div>

        <div className="ai-grid">
          <div className="ai-card">
            <h5>{campaigns?.churned?.label || 'Churned Customers (45 days se nahi aaye)'}</h5>
            <p>{campaigns?.churned?.count || 12} customers</p>
            <button className="form-button compact" disabled={sending} onClick={() => sendCampaign('churn')}>
              {campaigns?.churned?.buttonText || 'Send 20% OFF Campaign'}
            </button>
          </div>

          <div className="ai-card">
            <h5>{campaigns?.birthday?.label || 'Birthday This Week'}</h5>
            <p>{campaigns?.birthday?.count || 3} customers</p>
            <button className="form-button compact" disabled={sending} onClick={() => sendCampaign('birthday')}>
              {campaigns?.birthday?.buttonText || 'Send Auto Wish'}
            </button>
          </div>

          <div className="ai-card">
            <h5>AI Poster Generator</h5>
            <p>{campaigns?.poster?.title || 'Diwali Offer Poster'}</p>
            <button className="form-button compact" disabled={sending} onClick={() => sendCampaign('poster')}>
              Generate Diwali Offer Poster
            </button>
            <p style={{ marginTop: '12px' }}>{campaigns?.poster?.caption || 'Diwali glow hai, salon ka shine bhi!'}</p>
          </div>
        </div>

        {status && (
          <p style={{ marginTop: '14px', color: '#f9a8d4' }}>{status}</p>
        )}
      </section>
    </div>
  );
}

export default MarketingDashboard;
