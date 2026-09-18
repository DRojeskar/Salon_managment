import { useEffect, useState } from "react";
import { fetchSalonsFromApi, getActiveSalonId, setActiveSalon } from "../utils/salonData";
import { formatSalonHours } from "../utils/timeFormat";

function SalonSwitcher({ onChange, label = "Select salon" }) {
  const [salons, setSalons] = useState([]);
  const [activeId, setActiveId] = useState(getActiveSalonId());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const { salons: list } = await fetchSalonsFromApi();
        if (!mounted) return;
        setSalons(list);
        const current = getActiveSalonId() || list[0]?.id || "";
        if (current && !getActiveSalonId()) {
          await setActiveSalon(current);
        }
        setActiveId(current);
      } catch (error) {
        console.error("Failed to load salons", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = async (event) => {
    const nextId = event.target.value;
    setActiveId(nextId);
    await setActiveSalon(nextId);
    onChange?.(nextId);
  };

  if (loading) {
    return <p className="salon-switcher-loading">Loading salons...</p>;
  }

  if (!salons.length) {
    return <p className="salon-switcher-empty">No salons available yet.</p>;
  }

  return (
    <label className="salon-switcher">
      <span>{label}</span>
      <select className="form-input compact-select" value={activeId} onChange={handleChange}>
        {salons.map((salon) => (
          <option key={salon.id} value={salon.id}>
            {salon.name} ({formatSalonHours(salon.openTime, salon.closeTime)})
          </option>
        ))}
      </select>
    </label>
  );
}

export default SalonSwitcher;
