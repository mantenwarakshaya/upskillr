import { Link } from "react-router-dom";
import {
  FileText,
  GraduationCap,
  MessageSquareCode,
  SearchCode,
  ArrowRight,
} from "lucide-react";
import "./index.css";

const quickActions = [
  {
    path: "/resume-analyzer",
    step: "01",
    title: "Resume Analyzer",
    desc: "Upload your technical profile for an instant AI alignment audit.",
    icon: <FileText size={18} className="text-indigo-600" />,
  },
  {
    path: "/gap-analysis",
    step: "02",
    title: "Skill Gap Analysis",
    desc: "Isolate missing stack layers and compile your upskilling roadmaps.",
    icon: <GraduationCap size={18} className="text-violet-600" />,
  },
  {
    path: "/mock-interview",
    step: "03",
    title: "Mock Interview",
    desc: "Run dynamic, role-tailored audio or text mock sessions with feedback.",
    icon: <MessageSquareCode size={18} className="text-emerald-600" />,
  },
  {
    path: "/job-match",
    step: "04",
    title: "Smart Job Match",
    desc: "Cross-reference live profile metrics directly against open market pipelines.",
    icon: <SearchCode size={18} className="text-amber-600" />,
  },
];

export default function Dashboard({ user }) {
  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        
        {/* HERO ACCELERATOR HEADER */}
        <header className="dashboard-header" aria-label="Dashboard Overview">
          <div className="header-meta">
            <h1>Welcome back, {user?.firstName || "Developer"}</h1>
            <p>
              Analyze your engineering profile, remedy architecture gaps, and optimize your path to your target role.
            </p>
          </div>

          <div className="target-role" role="status">
            <span className="role-pulse" aria-hidden="true"></span>
            <span>Targeting: <strong>{user?.targetRole || "Software Engineer"}</strong></span>
          </div>
        </header>

        {/* METRICS GRID */}
        <section className="stats-grid" aria-label="Performance Metrics Dashboard">
          <StatCard
            title="Career Readiness Index"
            value="N/A"
            text="Awaiting initial resume ingestion parse"
            badge="Action Required"
            variant="gradient"
          />

          <StatCard
            title="Target Role Alignment"
            value="--"
            text="Locks instantly following your first tech assessment"
            badge="Locked"
            variant="default"
          />
        </section>

        {/* CORE JOURNEY SECTIONS */}
        <section className="career-section" aria-label="Accelerator Career Hub">
          <div className="section-header">
            <h2>Your Growth Framework</h2>
            <p>Progress sequentially through these modules to maximize profile placement efficiency.</p>
          </div>

          <div className="action-grid">
            {quickActions.map((item) => (
              <Link
                to={item.path}
                key={item.path}
                className="action-card"
                aria-label={`Maps to ${item.title}`}
              >
                <div className="action-card-header">
                  <span className="action-step">Step {item.step}</span>
                  <div className="action-icon" aria-hidden="true">
                    {item.icon}
                  </div>
                </div>
                
                <div className="action-card-body">
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>

                <div className="action-card-footer">
                  <span className="action-cta">Launch Workspace</span>
                  <ArrowRight size={14} className="arrow-icon" />
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

function StatCard({ title, value, text, badge, variant = "default" }) {
  return (
    <div className={`stat-card stat-card-${variant}`}>
      <div className="stat-header">
        <h3>{title}</h3>
        {badge && <span className="stat-badge">{badge}</span>}
      </div>
      <div className="stat-content">
        <div className="stat-value">{value}</div>
        <p className="stat-desc">{text}</p>
      </div>
    </div>
  );
}