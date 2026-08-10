import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

function Layout() {
  return (
    <div className="app-shell">
      <Sidebar />

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Salon management</p>
            <h2>Welcome back, Amina</h2>
          </div>
          <div className="topbar-pill">Today • 14 appointments</div>
        </header>

        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
