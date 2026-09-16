export function formatTime(value) {
  const raw = String(value || "").trim();
  if (!raw) return "Time not set";

  const match = raw.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (!match) return raw;

  let hour = Number(match[1]);
  const minute = match[2] || "00";
  const meridiem = match[3]?.toUpperCase();

  if (meridiem) {
    hour = hour === 0 ? 12 : hour;
    return `${String(hour).padStart(2, "0")}:${minute} ${meridiem}`;
  }

  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${String(displayHour).padStart(2, "0")}:${minute} ${suffix}`;
}

export function formatBookingDate(value) {
  const raw = String(value || "");
  const parts = raw.split("•");
  if (parts.length < 2) return raw;
  return `${parts[0].trim()} • ${formatTime(parts.slice(1).join("•").trim())}`;
}

export function getNextAppointmentSlot() {
  const appointment = new Date();
  appointment.setDate(appointment.getDate() + 1);
  appointment.setHours(appointment.getHours() + 1, 0, 0, 0);
  return {
    date: `Tomorrow ${appointment.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}`,
    time: formatTime(`${appointment.getHours()}:${String(appointment.getMinutes()).padStart(2, "0")}`),
    createdAt: new Date().toISOString(),
  };
}
