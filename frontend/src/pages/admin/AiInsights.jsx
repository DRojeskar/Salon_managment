import { useEffect, useState } from 'react';

const AI_ENDPOINT = 'http://localhost:5000/api/ai/recommendation';

function AiInsights() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInsights = async () => {
      try {
        const response = await fetch(AI_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookings: [
              { client: 'Neha', service: 'Haircut', status: 'Pending' },
              { client: 'Reema', service: 'Haircut', status: 'Pending' },
              { client: 'Asha', service: 'Color', status: 'Completed' },
            ],
            appointments: [
              { service: 'Haircut', staff: 'Sameer', status: 'Pending' },
              { service: 'Haircut', staff: 'Sameer', status: 'Pending' },
              { service: 'Color', staff: 'Aisha', status: 'Completed' },
            ],
            services: [
              { title: 'Haircut', price: 1200 },
              { title: 'Color', price: 1800 },
              { title: 'Keratin', price: 2500 },
            ],
            staff: [
              { name: 'Sameer', status: 'Available' },
              { name: 'Aisha', status: 'Busy' },
            ],
            slots: [
              { day: 'Saturday', time: '17:00', status: 'Open' },
              { day: 'Saturday', time: '18:00', status: 'Open' },
            ],
          }),
        });

        const data = await response.json();
        if (data.success) {
          setInsights(data.ownerInsights || data);
        }
      } catch (error) {
        console.error('AI insights failed', error);
      } finally {
        setLoading(false);
      }
    };

    loadInsights();
  }, []);

  if (loading) return <div className="panel-card"><p>Loading AI insights...</p></div>;

  return (
    <div className="page-stack">
      <section className="panel-card">
        <div className="panel-header">
          <h4>AI revenue assistant</h4>
          <span className="topbar-pill">Live updates</span>
        </div>

        <div className="ai-grid">
          <div className="ai-card">
            <h5>No-show prediction</h5>
            <div className="insight-list">
              <ul>
                {(insights?.noShowRisk || []).map((item, index) => (
                  <li key={index}><strong>{item.label}</strong> — {item.reason} {item.action}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="ai-card">
            <h5>Rush hour & staffing</h5>
            <div className="insight-list">
              <ul>
                {(insights?.rushHours || []).map((item, index) => (
                  <li key={index}><strong>{item.label}</strong> — {item.message} {item.action}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="ai-card">
            <h5>Inventory alerts</h5>
            <div className="insight-list">
              <ul>
                {(insights?.inventoryAlerts || []).map((item, index) => (
                  <li key={index}><strong>{item.item}</strong> — {item.message} {item.action}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="ai-card">
            <h5>Dynamic pricing</h5>
            <div className="insight-list">
              <ul>
                {(insights?.dynamicPricing || []).map((item, index) => (
                  <li key={index}><strong>{item.type}</strong> — {item.suggestion}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AiInsights;
