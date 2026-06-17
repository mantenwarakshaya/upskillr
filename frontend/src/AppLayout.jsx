import { Outlet } from "react-router-dom";
import Sidebar from "./components/Home/Sidebar";

export default function AppLayout({ user, onLogout }) {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-indigo-500/10">
      {/* Sidebar Component */}
      <Sidebar user={user} onLogout={onLogout} />

      {/* Primary Viewport Wrapper */}
      <div className="flex flex-1 flex-col md:pl-64 transition-all duration-300 ease-in-out">
        <main className="flex-1">
          <Outlet context={{ user }} />
        </main>
      </div>
    </div>
  );
}