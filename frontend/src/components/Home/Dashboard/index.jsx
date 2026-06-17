import React from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  GraduationCap,
  MessageSquareCode,
  SearchCode,
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock,
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
  // Simulating state checks for user progress
  const isResumeUploaded = user?.progress?.resumeUploaded || false;
  const isGapAnalyzed = user?.progress?.gapAnalyzed || false;
  const isInterviewDone = user?.progress?.interviewDone || false;

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        
        {/* HERO HEADER */}
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

        {/* SPECIAL DASHBOARD CORE HUB */}
        <div className="dashboard-main-grid">
          
          {/* LEFT: INTERACTIVE ONBOARDING */}
          <section className="dashboard-card onboarding-card">
            <div className="card-header-inline">
              <h2>Preparation Roadmap</h2>
              <span className="completion-badge">0/3 Complete</span>
            </div>
            
            <div className="checklist-container">
              <Link to="/resume-analyzer" className={`checklist-item ${isResumeUploaded ? 'done' : ''}`}>
                {isResumeUploaded ? <CheckCircle2 size={18} className="icon-done" /> : <Circle size={18} className="icon-todo" />}
                <div className="checklist-text">
                  <h4>Upload your master technical resume</h4>
                  <p>Unlocks your Career Readiness Index score and structural profile insights.</p>
                </div>
                <ArrowRight size={14} className="checklist-arrow" />
              </Link>

              <Link to="/gap-analysis" className={`checklist-item ${isGapAnalyzed ? 'done' : ''}`}>
                {isGapAnalyzed ? <CheckCircle2 size={18} className="icon-done" /> : <Circle size={18} className="icon-todo" />}
                <div className="checklist-text">
                  <h4>Run a role alignment skill assessment</h4>
                  <p>Identify missing backend/frontend layers against market demand.</p>
                </div>
                <ArrowRight size={14} className="checklist-arrow" />
              </Link>

              <Link to="/mock-interview" className={`checklist-item ${isInterviewDone ? 'done' : ''}`}>
                {isInterviewDone ? <CheckCircle2 size={18} className="icon-done" /> : <Circle size={18} className="icon-todo" />}
                <div className="checklist-text">
                  <h4>Complete an AI mock interview stream</h4>
                  <p>Practice live system architecture and coding interview scenarios.</p>
                </div>
                <ArrowRight size={14} className="checklist-arrow" />
              </Link>
            </div>
          </section>

          {/* RIGHT: LIVE ACTIVITY / PLATFORM SYSTEM FEED */}
          <section className="dashboard-card activity-card">
            <h2>Recent Activity Logs</h2>
            <div className="activity-feed">
              <div className="feed-item empty">
                <Clock size={20} className="empty-feed-icon" />
                <p>No optimization scans executed yet.</p>
                <Link to="/resume-analyzer" className="feed-action-btn">Initialize Profile Scan</Link>
              </div>
            </div>
          </section>

        </div>

        {/* WORKSPACE MODULES */}
        <section className="career-section">
          <div className="section-header">
            <h2>Quick Workspaces</h2>
          </div>

          <div className="action-grid">
            {quickActions.map((item) => (
              <Link to={item.path} key={item.path} className="action-card">
                <div className="action-card-header">
                  <span className="action-step">Step {item.step}</span>
                  <div className="action-icon">{item.icon}</div>
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