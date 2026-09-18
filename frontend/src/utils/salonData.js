import { createSalon, getSalons, setActiveSalon as setActiveSalonApi } from "../api/salonApi";

export const defaultStaff = [
  { id: 1, name: "Nadia", role: "Senior stylist", shift: "Morning", status: "Available" },
  { id: 2, name: "Sara", role: "Facialist", shift: "Afternoon", status: "On call" },
  { id: 3, name: "Lina", role: "Nail artist", shift: "Evening", status: "Available" },
];

export const defaultServices = [
  { id: 1, title: "Hair Styling", price: 45, duration: 45, category: "Hair" },
  { id: 2, title: "Facial Glow", price: 35, duration: 30, category: "Skin" },
  { id: 3, title: "Nail Art", price: 25, duration: 40, category: "Nails" },
  { id: 4, title: "Bridal Makeup", price: 90, duration: 90, category: "Events" },
];

export const defaultSlots = [
  { id: 1, day: "Today", time: "10:00 AM", status: "Open" },
  { id: 2, day: "Today", time: "11:30 AM", status: "Booked" },
  { id: 3, day: "Today", time: "2:00 PM", status: "Open" },
  { id: 4, day: "Tomorrow", time: "4:00 PM", status: "Open" },
];

export const defaultAppointments = [
  { id: 1, client: "Riya", service: "Hair Styling", time: "10:30 AM", staff: "Nadia", status: "Confirmed" },
  { id: 2, client: "Mina", service: "Facial Glow", time: "12:00 PM", staff: "Sara", status: "Pending" },
  { id: 3, client: "Aisha", service: "Nail Art", time: "3:30 PM", staff: "Lina", status: "Confirmed" },
];

export const defaultCustomerBookings = [
  { id: 1, service: "Hair Styling", date: "Aug 8, 10:30 AM", status: "Confirmed" },
  { id: 2, service: "Facial Glow", date: "Aug 10, 2:00 PM", status: "Pending" },
  { id: 3, service: "Nail Art", date: "Aug 12, 5:00 PM", status: "Confirmed" },
];

export const defaultSalonProfile = {
  id: "default-salon",
  name: "Glow Studio",
  phone: "+91 98765 43210",
  address: "MG Road, Jaipur",
  email: "hello@glowstudio.com",
  openTime: "09:00",
  closeTime: "21:00",
  createdAt: new Date().toISOString(),
};

export function readStorageList(key, fallback) {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStorageList(key, value) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function createId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export function normalizeSalonProfile(input = {}) {
  const base = { ...defaultSalonProfile, ...input };
  return {
    ...base,
    id: String(base.id || createId()),
    name: String(base.name || "Glow Studio").trim() || "Glow Studio",
    phone: String(base.phone || "").trim(),
    address: String(base.address || "").trim(),
    email: String(base.email || "").trim(),
    openTime: String(base.openTime || defaultSalonProfile.openTime),
    closeTime: String(base.closeTime || defaultSalonProfile.closeTime),
  };
}

export function getSalonProfiles() {
  const stored = readStorageList("glow_salons_cache", []);
  if (Array.isArray(stored) && stored.length) {
    return stored.map(normalizeSalonProfile);
  }
  return [];
}

export async function fetchSalonsFromApi() {
  const response = await getSalons();
  const salons = (response.data.salons || []).map(normalizeSalonProfile);
  writeStorageList("glow_salons_cache", salons);
  return { salons, scope: response.data.scope || "" };
}

export async function createSalonProfile(input = {}) {
  const response = await createSalon({
    name: input.name,
    phone: input.phone,
    address: input.address,
    openTime: input.openTime,
    closeTime: input.closeTime,
    email: input.email,
  });

  const salon = normalizeSalonProfile(response.data.salon || input);
  await fetchSalonsFromApi();

  if (response.data.activeSalonId) {
    localStorage.setItem("glow_active_salon_id", String(response.data.activeSalonId));
  }

  return salon;
}

export function getSalonById(id) {
  return getSalonProfiles().find((salon) => String(salon.id) === String(id)) || getSalonProfiles()[0];
}

export function getActiveSalonId() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem("glow_active_salon_id") || getSalonProfiles()[0]?.id || "";
}

export function getActiveSalon() {
  const salons = getSalonProfiles();
  const active = getActiveSalonId();
  return salons.find((salon) => String(salon.id) === String(active)) || salons[0] || null;
}

export async function setActiveSalon(id) {
  if (typeof window === "undefined") return null;

  const salonId = String(id);
  localStorage.setItem("glow_active_salon_id", salonId);

  try {
    await setActiveSalonApi(salonId);
  } catch (error) {
    console.error("Failed to sync active salon", error);
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("salon-changed"));
  }

  return getSalonById(salonId) || getActiveSalon();
}
