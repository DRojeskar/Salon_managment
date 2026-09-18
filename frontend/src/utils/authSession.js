import { writeStorageList } from "./salonData";

export function applyAuthSession({ user, salons, activeSalonId, salon }) {
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("role", user.role || "customer");
  }

  const nextSalons = salons?.length ? salons : salon ? [salon] : [];
  if (nextSalons.length) {
    writeStorageList("glow_salons_cache", nextSalons);
  }

  const resolvedActive = activeSalonId || user?.activeSalonId || nextSalons[0]?.id || "";
  if (resolvedActive) {
    localStorage.setItem("glow_active_salon_id", String(resolvedActive));
  }

  return resolvedActive;
}
