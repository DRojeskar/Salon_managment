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
