import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import Login from "./pages/Login";
import Register from "./pages/Register";
import RoleSelection from "./pages/RoleSelection";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Staff from "./pages/admin/Staff";
import Services from "./pages/admin/Services";
import Slots from "./pages/admin/Slots";
import Appointments from "./pages/admin/Appointments";
import AdminBookings from "./pages/admin/Bookings";
import AiInsights from "./pages/admin/AiInsights";
import MarketingDashboard from "./pages/admin/MarketingDashboard";
import CustomerLayout from "./pages/customer/CustomerLayout";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import CustomerBookings from "./pages/customer/CustomerBookings";
import CreateAdmin from "./pages/CreateAdmin";
import AiStyleStudio from "./pages/customer/AiStyleStudio";

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

function getUserRole() {
  const user = getStoredUser();
  return user?.role || localStorage.getItem("role") || "customer";
}

function ProtectedRoute({ children, allowedRoles = ["admin", "customer", "staff"] }) {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const role = getUserRole();
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/role-selection" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) {
    return children;
  }

  return <Navigate to="/role-selection" replace />;
}

function RootRedirect() {
  const token = localStorage.getItem("token");
  const role = getUserRole();
  if (!token) return <Navigate to="/login" replace />;
  return <Navigate to={role === "admin" ? "/admin/dashboard" : "/customer/dashboard"} replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />

        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/create-admin" element={<PublicRoute><CreateAdmin /></PublicRoute>} />

        <Route path="/role-selection" element={<ProtectedRoute><RoleSelection /></ProtectedRoute>} />

        <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Navigate replace to="dashboard" />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="staff" element={<Staff />} />
          <Route path="services" element={<Services />} />
          <Route path="slots" element={<Slots />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="ai-insights" element={<AiInsights />} />
          <Route path="marketing-dashboard" element={<MarketingDashboard />} />
        </Route>

        <Route path="/customer" element={<ProtectedRoute allowedRoles={["customer"]}><CustomerLayout /></ProtectedRoute>}>
          <Route index element={<Navigate replace to="dashboard" />} />
          <Route path="dashboard" element={<CustomerDashboard />} />
          <Route path="bookings" element={<CustomerBookings />} />
          <Route path="style-studio" element={<AiStyleStudio />} />
        </Route>

        <Route path="*" element={<Navigate replace to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;