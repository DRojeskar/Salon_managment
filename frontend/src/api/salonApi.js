import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const activeSalonId = localStorage.getItem("glow_active_salon_id");
  if (activeSalonId) {
    config.headers["x-salon-id"] = activeSalonId;
  }

  return config;
});

export const getSalons = () => API.get("/salons");
export const createSalon = (data) => API.post("/salons", data);
export const setActiveSalon = (salonId) => API.patch("/salons/active", { salonId });
export const deleteSalon = (salonId) => {
  const id = String(salonId || "").trim();
  if (!id) {
    return Promise.reject(new Error("Salon id is missing"));
  }
  return API.post("/salons/remove", { salonId: id });
};

export const getStaff = () => API.get("/staff");
export const createStaff = (data) => API.post("/staff", data);
export const updateStaff = (id, data) => API.put(`/staff/${id}`, data);
export const deleteStaff = (id) => API.delete(`/staff/${id}`);

export const getServices = () => API.get("/services");
export const createService = (data) => API.post("/services", data);
export const updateService = (id, data) => API.put(`/services/${id}`, data);
export const deleteService = (id) => API.delete(`/services/${id}`);

export const getSlots = () => API.get("/slots");
export const createSlot = (data) => API.post("/slots", data);
export const updateSlot = (id, data) => API.put(`/slots/${id}`, data);
export const deleteSlot = (id) => API.delete(`/slots/${id}`);

export const getAppointments = () => API.get("/appointments");
export const createAppointment = (data) => API.post("/appointments", data);
export const updateAppointment = (id, data) => API.put(`/appointments/${id}`, data);
export const deleteAppointment = (id) => API.delete(`/appointments/${id}`);

export const getBookings = () => API.get("/bookings");
export const createBooking = (data) => API.post("/bookings", data);
export const updateBooking = (id, data) => API.put(`/bookings/${id}`, data);
export const deleteBooking = (id) => API.delete(`/bookings/${id}`);

export const getClients = () => API.get("/clients");
export const chatWithGlow = (message) => API.post("/ai/chat", { message });

export const getAiRecommendation = (payload) => API.post("/ai/recommendation", payload);

export default API;
