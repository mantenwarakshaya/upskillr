import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileSearch,
  GraduationCap,
  Briefcase,
  UserCircle,
  LogOut,
  Bell
} from "lucide-react";
import "./index.css";

export const APP_PATHS = {
  dashboard: "/dashboard",
  resumeAnalyzer: "/resume-analyzer",
  gapAnalysis: "/gap-analysis",
  jobMatch: "/job-match",
  profile: "/profile",
  landing: "/"
};

const menuItems = [
  {
    title: "Analyze",
    items: [
      {
        path: APP_PATHS.resumeAnalyzer,
        icon: <FileSearch size={18} strokeWidth={2.2} />,
        label: "Resume Analyzer"
      },
      {
        path: APP_PATHS.gapAnalysis,
        icon: <GraduationCap size={18} strokeWidth={2.2} />,
        label: "Skill Gap Analysis"
      }
    ]
  },
  {
    title: "Grow & Land",
    items: [
      {
        path: APP_PATHS.jobMatch,
        icon: <Briefcase size={18} strokeWidth={2.2} />,
        label: "Smart Job Match"
      }
    ]
  }
];

export default function Sidebar({ onLogout }) {
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    if (!toastMessage) return;

    const timer = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const handleLogout = async () => {
    try {
      setToastMessage("Signing out...");
      await onLogout?.();
    } catch {
      setToastMessage("Logout failed.");
    } finally {
      navigate(APP_PATHS.landing, { replace: true });
    }
  };

  return (
    <aside className="s-job-sidebar" aria-label="Main navigation">
      {toastMessage && (
        <div className="s-job-toast" role="status" aria-live="polite">
          <Bell size={14} className="s-job-toast-icon" />
          <span className="s-job-toast-text">{toastMessage}</span>
        </div>
      )}

      <div className="s-job-brand">
        <div className="s-job-logo-mark" aria-hidden="true">
          <span>U</span>
        </div>

        <div className="s-job-brand-meta">
          <h1 className="s-job-brand-title">Upskillr</h1>
          <p className="s-job-brand-subtitle">AI Career Accelerator</p>
        </div>
      </div>

      <nav className="s-job-nav">
        <SidebarLink
          to={APP_PATHS.dashboard}
          icon={<LayoutDashboard size={18} strokeWidth={2.2} />}
          label="Dashboard"
          end
        />

        {menuItems.map((section) => (
          <div key={section.title} className="s-job-section">
            <h2 className="s-job-section-title">{section.title}</h2>

            <div className="s-job-section-links">
              {section.items.map((item) => (
                <SidebarLink
                  key={item.path}
                  to={item.path}
                  icon={item.icon}
                  label={item.label}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="s-job-footer">
        <SidebarLink
          to={APP_PATHS.profile}
          icon={<UserCircle size={18} strokeWidth={2.2} />}
          label="Profile Settings"
        />

        <button
          className="s-job-logout-btn"
          onClick={handleLogout}
          type="button"
          aria-label="Log out"
        >
          <span className="s-job-icon-wrapper" aria-hidden="true">
            <LogOut size={18} strokeWidth={2.2} />
          </span>
          <span className="s-job-link-text">Logout</span>
        </button>
      </div>
    </aside>
  );
}

function SidebarLink({ to, icon, label, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `s-job-link ${isActive ? "s-job-link-active" : ""}`
      }
    >
      <span className="s-job-icon-wrapper" aria-hidden="true">
        {icon}
      </span>
      <span className="s-job-link-text">{label}</span>
    </NavLink>
  );
}