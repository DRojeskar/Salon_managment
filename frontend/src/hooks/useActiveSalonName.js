import { useEffect, useState } from "react";
import { getActiveSalon } from "../utils/salonData";

export function useActiveSalonName(fallback = "SalonPro") {
  const [name, setName] = useState(() => getActiveSalon()?.name || fallback);

  useEffect(() => {
    const refresh = () => setName(getActiveSalon()?.name || fallback);
    refresh();
    window.addEventListener("salon-changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("salon-changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [fallback]);

  return name;
}
