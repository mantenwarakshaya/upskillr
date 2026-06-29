import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  FileText,
  GraduationCap,
  MessageSquareCode,
  SearchCode,
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock,
  Zap,
  BarChart2,
  Target,
} from "lucide-react";
import "./index.css";

const API_BASE_URL = import.meta.env?.VITE_API_URL || "http://localhost:7777";

/* ── workspace cards ─────────────────────────────────────────── */
const workspaces = [
  {
    path:  "/resume-analyzer",
    step:  "01",
    title: "Resume Analyzer",
    desc:  "Upload your resume for an instant AI alignment audit and ATS score.",
    accent: "blue",
    Icon:  FileText,
  },
  {
    path:  "/gap-analysis",
    step:  "02",
    title: "Skill Gap Analysis",
    desc:  "Identify missing skills and receive a phased learning roadmap.",
    accent: "violet",
    Icon:  GraduationCap,
  },
  {
    path:  "/mock-interview",
    step:  "03",
    title: "Mock Interview",
    desc:  "Run adaptive AI interview sessions with detailed performance feedback.",
    accent: "green",
    Icon:  MessageSquareCode,
  },
  {
    path:  "/job-match",
    step:  "04",
    title: "Smart Job Match",
    desc:  "Cross-reference your profile against live market demand and open roles.",
    accent: "orange",
    Icon:  SearchCode,
  },
];

/* ── activity event formatter ────────────────────────────────── */
function formatActivity(items) {
  return items.slice(0, 5).map((item) => ({
    id:    item._id,
    label: item.targetRole || item.role || "General Scan",
    type:  item.matchPercentage !== undefined
      ? "gap"
      : item.feedback?.score !== undefined
      ? "interview"
      : "resume",
    score: item.matchPercentage ?? item.feedback?.score ?? item.aiAnalysis?.score ?? null,
    date:  new Date(item.createdAt).toLocaleDateString("en-GB", {
      day: "numeric", month: "short",
    }),
  }));
}

const activityMeta = {
  gap:       { label: "Gap Analysis",    color: "var(--d-violet)", bg: "var(--d-violet-light)" },
  interview: { label: "Mock Interview",  color: "var(--d-green)",  bg: "var(--d-green-light)"  },
  resume:    { label: "Resume Scan",     color: "var(--d-blue)",   bg: "var(--d-blue-light)"   },
};

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function Dashboard({ user }) {
  const [activity, setActivity]         = useState([]);
  const [actLoading, setActLoading]     = useState(true);

  // Real progress flags — derived from API responses, not user.progress.*
  const [isResumeUploaded, setIsResumeUploaded] = useState(false);
  const [isGapAnalyzed,    setIsGapAnalyzed]    = useState(false);
  const [isInterviewDone,  setIsInterviewDone]  = useState(false);

  const completedSteps = [isResumeUploaded, isGapAnalyzed, isInterviewDone].filter(Boolean).length;

  /* ── Fetch all dashboard data in one pass ─────────────────── */
  const fetchActivity = useCallback(async () => {
    try {
      const [resumeRes, gapRes, ivRes] = await Promise.allSettled([
        axios.get(`${API_BASE_URL}/api/resume/latest`,       { withCredentials: true }),
        axios.get(`${API_BASE_URL}/api/gap/history`, { withCredentials: true }), // ← was /api/gap-analysis
        axios.get(`${API_BASE_URL}/api/interview/history`,   { withCredentials: true }),
      ]);

      // Resume done: 200 + data present
      if (resumeRes.status === "fulfilled" && resumeRes.value.data?.success) {
        setIsResumeUploaded(true);
      }

      // Gap done: history array has at least one entry
      const gapHistory = gapRes.status === "fulfilled"
        ? (gapRes.value.data?.history ?? [])
        : [];
      if (gapHistory.length > 0) {
        setIsGapAnalyzed(true);
      }

      // Interview done: at least one completed interview
      const interviews = ivRes.status === "fulfilled"
        ? (ivRes.value.data?.interviews ?? [])
        : [];
      if (interviews.some((iv) => iv.completed)) {
        setIsInterviewDone(true);
      }

      // Build activity feed
      const items = [];

      if (gapHistory.length > 0) {
        items.push(...gapHistory);
      }
      if (interviews.length) {
        items.push(...interviews);
      }
      if (resumeRes.status === "fulfilled" && resumeRes.value.data?.data) {
        items.push(resumeRes.value.data.data);
      }

      items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setActivity(formatActivity(items));
    } catch {
      /* silent */
    } finally {
      setActLoading(false);
    }
  }, []);

  useEffect(() => { fetchActivity(); }, [fetchActivity]);

  /* credits */
  const credits = user?.aiUsage?.creditsRemaining ?? 20;
  const maxCredits = 20;
  const creditPct  = Math.min((credits / maxCredits) * 100, 100);

  return (
    <div className="d-root">
      <div className="d-container">

        {/* ── Hero header ─────────────────────────────────────── */}
        <header className="d-hero">
          <div className="d-hero-left">
            <h1 className="d-hero-title">
              Welcome back, <span className="d-hero-name">{user?.firstName || "Developer"}</span>
            </h1>
            <p className="d-hero-sub">
              Track your career progress, run AI tools, and close the gap to your target role.
            </p>
          </div>

          <div className="d-hero-right">
            <div className="d-target-pill">
              <span className="d-pulse" aria-hidden="true" />
              <Target size={13} />
              <span>Targeting: <strong>{user?.targetRole || "Software Engineer"}</strong></span>
            </div>

            <div className="d-credits-pill">
              <Zap size={13} className="d-credits-zap" />
              <span>{credits}/{maxCredits} Credits</span>
              <div className="d-credits-mini-bar">
                <div className="d-credits-mini-fill" style={{ width: `${creditPct}%` }} />
              </div>
            </div>
          </div>
        </header>

        {/* ── Main 2-col grid ─────────────────────────────────── */}
        <div className="d-main-grid">

          {/* Preparation roadmap */}
          <section className="d-card d-checklist-card">
            <div className="d-card-header">
              <h2 className="d-card-title">Preparation Roadmap</h2>
              <span className={`d-badge ${completedSteps === 3 ? "d-badge--done" : ""}`}>
                {actLoading ? "…" : `${completedSteps}/3 Complete`}
              </span>
            </div>

            {/* Progress bar */}
            <div className="d-progress-bar">
              <div
                className="d-progress-fill"
                style={{ width: actLoading ? "0%" : `${(completedSteps / 3) * 100}%` }}
              />
            </div>

            <div className="d-checklist">
              {[
                {
                  to:    "/resume-analyzer",
                  done:  isResumeUploaded,
                  title: "Upload your resume",
                  sub:   "Unlocks your ATS score and skill extraction.",
                },
                {
                  to:    "/gap-analysis",
                  done:  isGapAnalyzed,
                  title: "Run a skill gap analysis",
                  sub:   "Identify missing skills against market demand.",
                },
                {
                  to:    "/mock-interview",
                  done:  isInterviewDone,
                  title: "Complete a mock interview",
                  sub:   "Practice with AI and get scored performance feedback.",
                },
              ].map(({ to, done, title, sub }) => (
                <Link key={to} to={to} className={`d-checklist-item ${done ? "d-checklist-item--done" : ""}`}>
                  {done
                    ? <CheckCircle2 size={17} className="d-check-icon d-check-icon--done" />
                    : <Circle       size={17} className="d-check-icon d-check-icon--todo" />
                  }
                  <div className="d-checklist-text">
                    <h4>{title}</h4>
                    <p>{sub}</p>
                  </div>
                  <ArrowRight size={13} className="d-checklist-arrow" />
                </Link>
              ))}
            </div>
          </section>

          {/* Activity feed */}
          <section className="d-card d-activity-card">
            <div className="d-card-header">
              <h2 className="d-card-title">Recent Activity</h2>
              {activity.length > 0 && (
                <span className="d-badge">{activity.length} record{activity.length > 1 ? "s" : ""}</span>
              )}
            </div>

            {actLoading ? (
              <div className="d-activity-loading">
                <div className="d-skeleton" />
                <div className="d-skeleton d-skeleton--short" />
                <div className="d-skeleton" />
              </div>
            ) : activity.length === 0 ? (
              <div className="d-activity-empty">
                <Clock size={22} className="d-empty-icon" />
                <p>No activity yet</p>
                <Link to="/resume-analyzer" className="d-empty-btn">
                  Start with Resume Analyzer
                </Link>
              </div>
            ) : (
              <ul className="d-activity-list">
                {activity.map((item) => {
                  const meta = activityMeta[item.type] || activityMeta.resume;
                  return (
                    <li key={item.id} className="d-activity-item">
                      <span
                        className="d-activity-dot"
                        style={{ background: meta.bg, color: meta.color }}
                      >
                        <BarChart2 size={11} />
                      </span>
                      <div className="d-activity-body">
                        <span className="d-activity-label">{item.label}</span>
                        <span
                          className="d-activity-type"
                          style={{ color: meta.color }}
                        >
                          {meta.label}
                        </span>
                      </div>
                      <div className="d-activity-right">
                        {item.score !== null && (
                          <span className="d-activity-score">{item.score}%</span>
                        )}
                        <span className="d-activity-date">{item.date}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        {/* ── Quick workspaces ─────────────────────────────────── */}
        <section className="d-workspaces">
          <div className="d-section-header">
            <h2 className="d-section-title">Quick Workspaces</h2>
            <p className="d-section-sub">Jump directly into any tool</p>
          </div>

          <div className="d-workspace-grid">
            {workspaces.map(({ path, step, title, desc, accent, Icon }) => (
              <Link key={path} to={path} className={`d-workspace-card d-workspace-card--${accent}`}>
                <div className="d-workspace-top">
                  <span className="d-workspace-step">Step {step}</span>
                  <div className="d-workspace-icon">
                    <Icon size={17} />
                  </div>
                </div>
                <div className="d-workspace-body">
                  <h3 className="d-workspace-title">{title}</h3>
                  <p className="d-workspace-desc">{desc}</p>
                </div>
                <div className="d-workspace-footer">
                  <span className="d-workspace-cta">Launch</span>
                  <ArrowRight size={13} className="d-workspace-arrow" />
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}