// import "dotenv/config";
// import express from "express";
// import cors from "cors";
// import authRoutes from "./routes/auth.js";
// import staffRoutes from "./routes/staff.js";
// import servicesRoutes from "./routes/services.js";
// import slotsRoutes from "./routes/slots.js";
// import appointmentsRoutes from "./routes/appointments.js";
// import bookingsRoutes from "./routes/bookings.js";
// import clientsRoutes from "./routes/clients.js";
// import { connectDatabase } from "./db.js";

// const app = express();
// const PORT = process.env.PORT || 5000;

// app.use(cors());
// app.use(express.json());

// app.use("/api/auth", authRoutes);
// app.use("/api/staff", staffRoutes);
// app.use("/api/services", servicesRoutes);
// app.use("/api/slots", slotsRoutes);
// app.use("/api/appointments", appointmentsRoutes);
// app.use("/api/bookings", bookingsRoutes);
// app.use("/api/clients", clientsRoutes);

// app.get("/api/health", (req, res) => {
//   res.json({ success: true, message: "Salon backend is running" });
// });

// app.use((req, res) => {
//   res.status(404).json({ success: false, message: "Endpoint not found" });
// });

// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(err.status || 500).json({ success: false, message: err.message || "Server error" });
// });

// connectDatabase().then(() => {
//   app.listen(PORT, () => {
//     console.log(`Salon backend listening on http://localhost:${PORT}`);
//   });
// });


import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import staffRoutes from "./routes/staff.js";
import servicesRoutes from "./routes/services.js";
import slotsRoutes from "./routes/slots.js";
import appointmentsRoutes from "./routes/appointments.js";
import bookingsRoutes from "./routes/bookings.js";
import clientsRoutes from "./routes/clients.js";
import aiRoutes from "./routes/ai.js";
import salonsRoutes from "./routes/salons.js";
import { connectDatabase } from "./db.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "12mb" }));

// ✅ ADD THIS - Root route handler
app.get("/", (req, res) => {
  res.json({ 
    success: true, 
    message: "Salon Management API is running!",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      staff: "/api/staff",
      services: "/api/services",
      slots: "/api/slots",
      appointments: "/api/appointments",
      bookings: "/api/bookings",
      clients: "/api/clients",
      salons: "/api/salons",
      salonDelete: "POST /api/salons/remove"
    }
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/slots", slotsRoutes);
app.use("/api/appointments", appointmentsRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/clients", clientsRoutes);
app.use("/api/salons", salonsRoutes);
app.use("/api/ai", aiRoutes);

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Salon backend is running" });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Endpoint not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || "Server error" });
});

connectDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Salon backend listening on http://localhost:${PORT}`);
  });
});