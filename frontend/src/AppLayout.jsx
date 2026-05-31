import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import "./index.css";

export default function AppLayout() {
  return (
    <div className="dashboard-app-shell">
      {/* The Sidebar stays fixed right here */}
      <Sidebar />

      {/* The nested views dynamically mount and unmount inside this Outlet */}
      <main className="dashboard-main-viewport">
        <Outlet />
      </main>
    </div>
  );
}