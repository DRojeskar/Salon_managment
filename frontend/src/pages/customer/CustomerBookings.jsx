import { useEffect, useState } from "react";
import { deleteBooking, getBookings } from "../../api/salonApi";

function CustomerBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
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
      </div>

      {loading ? (
        <div>Loading bookings...</div>
      ) : (
        <div className="list-stack">
          {bookings.map((item) => (
            <div key={item.id} className="list-item">
              <div>
                <strong>{item.service}</strong>
                <p>{item.date}</p>
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
