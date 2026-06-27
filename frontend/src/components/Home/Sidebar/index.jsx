import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileSearch,
  GraduationCap,
  Briefcase,
  UserCircle,
  LogOut,
  MessageSquareCode,
  Zap,
  ChevronRight,
} from "lucide-react";
import "./index.css";

export const APP_PATHS = {
  dashboard:      "/dashboard",
  resumeAnalyzer: "/resume-analyzer",
  gapAnalysis:    "/gap-analysis",
  jobMatch:       "/job-match",
  mockInterview:  "/mock-interview",
  profile:        "/profile",
  landing:        "/",
};

const menuItems = [
  {
    title: "Analyze",
    items: [
      { path: APP_PATHS.resumeAnalyzer, icon: <FileSearch size={17} strokeWidth={2.2} />,        label: "Resume Analyzer"   },
      { path: APP_PATHS.gapAnalysis,    icon: <GraduationCap size={17} strokeWidth={2.2} />,     label: "Skill Gap Analysis" },
    ],
  },
  {
    title: "Grow & Land",
    items: [
      { path: APP_PATHS.jobMatch, icon: <Briefcase size={17} strokeWidth={2.2} />, label: "Smart Job Match" },
    ],
  },
  {
    title: "Practice",
    items: [
      { path: APP_PATHS.mockInterview, icon: <MessageSquareCode size={17} strokeWidth={2.2} />, label: "Mock Interview" },
    ],
  },
];

/* ─── Credit colour helper ───────────────────────────────────── */
function creditColor(pct) {
  if (pct > 50) return "var(--sb-accent)";
  if (pct > 20) return "#f59e0b";
  return "#ef4444";
}

/* ═══════════════════════════════════════════════════════════════
   MAIN EXPORT
═══════════════════════════════════════════════════════════════ */
export default function Sidebar({ onLogout, user }) {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleLogout = async () => {
    try {
      setToast("Signing out…");
      await onLogout?.();
    } catch {
      setToast("Logout failed.");
    } finally {
      navigate(APP_PATHS.landing, { replace: true });
    }
  };

  const creditsRemaining = user?.aiUsage?.creditsRemaining ?? 0;
  const maxCredits       = 20;
  const creditPct        = Math.min((creditsRemaining / maxCredits) * 100, 100);
  const fillColor        = creditColor(creditPct);

  return (
    <aside className="sb-root" aria-label="Main navigation">

      {/* Toast */}
      {toast && (
        <div className="sb-toast" role="status" aria-live="polite">
          <Zap size={13} className="sb-toast-icon" />
          <span>{toast}</span>
        </div>
      )}

      {/* ── Brand ─────────────────────────────────────────────── */}
      <div className="sb-brand">
        <div className="sb-logo" aria-hidden="true">U</div>
        <div className="sb-brand-text">
          <span className="sb-brand-name">Upskillr</span>
          <span className="sb-brand-sub">AI Career Accelerator</span>
        </div>
      </div>

      {/* ── Nav ───────────────────────────────────────────────── */}
      <nav className="sb-nav">
        <SidebarLink
          to={APP_PATHS.dashboard}
          icon={<LayoutDashboard size={17} strokeWidth={2.2} />}
          label="Dashboard"
          end
        />

        {menuItems.map((section) => (
          <div key={section.title} className="sb-section">
            <p className="sb-section-label">{section.title}</p>
            {section.items.map((item) => (
              <SidebarLink key={item.path} to={item.path} icon={item.icon} label={item.label} />
            ))}
          </div>
        ))}
      </nav>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="sb-footer">

        {/* Credits card */}
        <div className="sb-credits">
          <div className="sb-credits-row">
            <span className="sb-credits-label">
              <Zap size={12} className="sb-credits-zap" />
              AI Credits
            </span>
            <strong className="sb-credits-value" style={{ color: fillColor }}>
              {creditsRemaining}/{maxCredits}
            </strong>
          </div>
          <div className="sb-credits-track">
            <div
              className="sb-credits-fill"
              style={{ width: `${creditPct}%`, background: fillColor }}
            />
          </div>
          {creditPct <= 20 && (
            <p className="sb-credits-warn">Running low — top up soon</p>
          )}
        </div>

        {/* Profile + Logout */}
        <div className="sb-footer-links">
          <SidebarLink
            to={APP_PATHS.profile}
            icon={<UserCircle size={17} strokeWidth={2.2} />}
            label="Profile Settings"
          />

          <button className="sb-link sb-logout" onClick={handleLogout} type="button" aria-label="Log out">
            <span className="sb-icon"><LogOut size={17} strokeWidth={2.2} /></span>
            <span className="sb-link-label">Logout</span>
          </button>
        </div>
      </footer>
    </aside>
  );
}

/* ─── SidebarLink ────────────────────────────────────────────── */
function SidebarLink({ to, icon, label, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => `sb-link${isActive ? " sb-link--active" : ""}`}
    >
      {({ isActive }) => (
        <>
          <span className="sb-icon">{icon}</span>
          <span className="sb-link-label">{label}</span>
          {isActive && <ChevronRight size={13} className="sb-link-chevron" />}
        </>
      )}
    </NavLink>
  );
}
