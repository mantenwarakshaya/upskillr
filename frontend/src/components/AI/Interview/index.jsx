import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  FaRocket,
  FaHistory,
  FaSpinner,
  FaCoins,
  FaClipboardCheck,
  FaChartLine,
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationTriangle,
  FaRegClock,
  FaUserTie,
  FaCommentDots,
} from "react-icons/fa";
import { LoaderView } from "../../Common";
import "./index.css";

const API_BASE_URL = import.meta.env?.VITE_API_URL || "http://localhost:7777";

/* ─── Score Ring ─────────────────────────────────────────────── */
function ScoreRing({ score }) {
  const max = 10;
  const pct = (score / max) * 100;
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const color = score >= 8 ? "var(--i-green)" : score >= 6 ? "var(--i-blue)" : "var(--i-orange)";
  const label = score >= 8 ? "Excellent" : score >= 6 ? "Good" : "Needs Work";

  return (
    <div className="i-score-ring-wrap">
      <svg className="i-score-svg" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} className="i-ring-track" />
        <circle
          cx="60" cy="60" r={r}
          className="i-ring-fill"
          style={{ strokeDasharray: circ, strokeDashoffset: offset, stroke: color }}
        />
        <text x="60" y="56" className="i-ring-score">{score}</text>
        <text x="60" y="72" className="i-ring-denom">/10</text>
      </svg>
      <span className="i-ring-label" style={{ color }}>{label}</span>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */
export default function Interview({ user }) {
  const [history, setHistory]                   = useState([]);
  const [mode, setMode]                         = useState("landing");
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [reportLoading, setReportLoading]       = useState(false);
  const [isLoading, setIsLoading]               = useState(true);
  const [isStarting, setIsStarting]             = useState(false);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/interview/history`, { withCredentials: true });
      setHistory(res.data?.interviews || []);
    } catch (err) {
      console.error("Failed to fetch interview history:", err);
    }
  }, []);

  const fetchInterviewReport = async (id) => {
    try {
      setReportLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/interview/${id}`, { withCredentials: true });
      setSelectedInterview(res.data.interview);
      setMode("report");
    } catch {
      alert("Unable to load interview report");
    } finally {
      setReportLoading(false);
    }
  };

  const handleStart = async () => {
    setIsStarting(true);
    try {
      await axios.post(
        `${API_BASE_URL}/api/interview/start`,
        { role: user?.targetRole },
        { withCredentials: true }
      );
      await fetchHistory();
    } catch {
      alert("Unable to start interview");
    } finally {
      setIsStarting(false);
    }
  };

  useEffect(() => {
    const init = async () => { await fetchHistory(); setIsLoading(false); };
    init();
  }, [fetchHistory]);

  if (isLoading) return <LoaderView message="Preparing your interview environment…" />;

  const avgScore =
    history.length > 0
      ? (
          history
            .filter((h) => h.feedback?.score)
            .reduce((acc, h) => acc + (h.feedback?.score || 0), 0) /
          (history.filter((h) => h.feedback?.score).length || 1)
        ).toFixed(1)
      : "--";

  /* ════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════ */
  return (
    <main className="i-root">

      {/* ══════════════  LANDING  ══════════════ */}
      {mode === "landing" && (
        <div className="i-landing-layout">

          {/* Main card */}
          <section className="i-card i-main-card">
            <span className="i-eyebrow">AI Interview Simulator</span>
            <h1 className="i-display-title">Mock Interview</h1>
            <p className="i-lead">
              Practice realistic AI-powered interviews tailored to your target
              role and receive detailed performance feedback.
            </p>

            <div className="i-divider" />

            <p className="i-section-label">Interview Workflow</p>
            <div className="i-steps">
              {[
                { n: "1", icon: <FaUserTie />, title: "Role Context",       desc: "Questions are generated based on your target role and experience level." },
                { n: "2", icon: <FaCommentDots />, title: "AI Interview",   desc: "Answer 5 adaptive technical and behavioural questions." },
                { n: "3", icon: <FaChartLine />, title: "Performance Report", desc: "Receive a score, strengths, improvement areas, and recommendations." },
              ].map(({ n, icon, title, desc }) => (
                <div key={n} className="i-step-row">
                  <div className="i-step-circle">{icon}</div>
                  <div className="i-step-body">
                    <strong>{title}</strong>
                    <span>{desc}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="i-action-row">
              {history.length > 0 && (
                <button className="i-btn i-btn--ghost" onClick={() => setMode("history")}>
                  <FaHistory /> Previous Sessions
                </button>
              )}
              <button className="i-btn i-btn--primary" onClick={handleStart} disabled={isStarting}>
                {isStarting ? <FaSpinner className="i-spin" /> : <FaRocket />}
                {isStarting ? "Initializing…" : "Start Interview"}
              </button>
            </div>
          </section>

          {/* Sidebar */}
          <aside className="i-card i-sidebar-card">
            <p className="i-section-label">Interview Intelligence</p>
            <div className="i-metrics-stack">
              {[
                { icon: <FaCoins />,         label: "Credits Available", value: user?.aiUsage?.creditsRemaining ?? 0, accent: "blue" },
                { icon: <FaClipboardCheck />, label: "Total Sessions",   value: history.length,                        accent: "violet" },
                { icon: <FaChartLine />,      label: "Average Score",    value: avgScore,                              accent: "green" },
                { icon: <FaCheckCircle />,    label: "AI Engine",        value: "Active",                              accent: "green" },
              ].map(({ icon, label, value, accent }) => (
                <div key={label} className={`i-metric-tile i-metric--${accent}`}>
                  <span className="i-metric-icon">{icon}</span>
                  <div className="i-metric-body">
                    <span className="i-metric-label">{label}</span>
                    <strong className="i-metric-value">{value}</strong>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      )}

      {/* ══════════════  HISTORY  ══════════════ */}
      {mode === "history" && (
        <div className="i-single-layout">
          <section className="i-card i-full-card">
            <div className="i-page-nav">
              <button className="i-btn i-btn--ghost i-btn--sm" onClick={() => setMode("landing")}>
                <FaArrowLeft /> Back
              </button>
              <h2 className="i-page-title">Interview History</h2>
            </div>

            {history.length === 0 ? (
              <div className="i-empty-state">
                <FaClipboardCheck className="i-empty-icon" />
                <p>No sessions yet. Start your first interview!</p>
              </div>
            ) : (
              <div className="i-history-list">
                {history.map((item) => {
                  const score = item.feedback?.score ?? 0;
                  const scoreClass = score >= 8 ? "i-score--high" : score >= 6 ? "i-score--mid" : "i-score--low";
                  return (
                    <div key={item._id} className="i-session-card">
                      <div className="i-session-left">
                        <div className={`i-session-score ${scoreClass}`}>
                          {score}<span>/10</span>
                        </div>
                        <div className="i-session-meta">
                          <strong className="i-session-role">{item.role}</strong>
                          <span className="i-session-date">
                            <FaRegClock />
                            {new Date(item.createdAt).toLocaleDateString("en-GB", {
                              day: "numeric", month: "short", year: "numeric",
                            })}
                          </span>
                          <span className={`i-status-badge ${item.completed ? "i-status--done" : "i-status--progress"}`}>
                            {item.completed ? "Completed" : "In Progress"}
                          </span>
                        </div>
                      </div>
                      <button
                        className="i-btn i-btn--primary i-btn--sm"
                        onClick={() => fetchInterviewReport(item._id)}
                        disabled={reportLoading}
                      >
                        {reportLoading ? <FaSpinner className="i-spin" /> : null}
                        View Report
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}

      {/* ══════════════  REPORT  ══════════════ */}
      {mode === "report" && selectedInterview && (
        <div className="i-single-layout">
          <section className="i-card i-full-card">

            {/* Nav */}
            <div className="i-page-nav">
              <button className="i-btn i-btn--ghost i-btn--sm" onClick={() => setMode("history")}>
                <FaArrowLeft /> Back
              </button>
              <h2 className="i-page-title">{selectedInterview.role} — Interview Report</h2>
            </div>

            {reportLoading ? (
              <LoaderView message="Loading report…" />
            ) : (
              <>
                {/* Hero */}
                <div className="i-report-hero">
                  <ScoreRing score={selectedInterview.feedback?.score ?? 0} />
                  <div className="i-report-hero-meta">
                    <span className="i-eyebrow">Overall Performance</span>
                    <h3 className="i-hero-role">{selectedInterview.role}</h3>
                    <p className="i-hero-sub">
                      Completed on{" "}
                      {new Date(selectedInterview.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric", month: "long", year: "numeric",
                      })}
                    </p>
                    <div className="i-hero-chips">
                      <span className="i-chip">💬 {selectedInterview.questions?.length ?? 0} Questions</span>
                      <span className="i-chip">⏱ {selectedInterview.questions?.length ?? 0} Answers</span>
                    </div>
                  </div>

                  {/* Summary inside hero */}
                  <div className="i-summary-box">
                    <p className="i-section-label" style={{ marginBottom: "10px" }}>Summary</p>
                    <p className="i-summary-text">{selectedInterview.feedback?.summary}</p>
                  </div>
                </div>

                {/* Strengths + Improvements */}
                <div className="i-two-col">
                  <div className="i-panel">
                    <div className="i-panel-header i-panel--green">
                      <FaCheckCircle /> Strengths
                    </div>
                    <ul className="i-feedback-list">
                      {selectedInterview.feedback?.strengths?.map((item, i) => (
                        <li key={i}>
                          <span className="i-check-dot i-check-dot--green">✓</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="i-panel">
                    <div className="i-panel-header i-panel--orange">
                      <FaExclamationTriangle /> Areas to Improve
                    </div>
                    <ul className="i-feedback-list">
                      {selectedInterview.feedback?.improvements?.map((item, i) => (
                        <li key={i}>
                          <span className="i-check-dot i-check-dot--orange">→</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Q&A */}
                <div className="i-qa-section">
                  <p className="i-section-label" style={{ marginBottom: "16px" }}>Questions & Answers</p>
                  <div className="i-qa-list">
                    {selectedInterview.questions?.map((question, idx) => (
                      <div key={idx} className="i-qa-card">
                        <div className="i-qa-number">Q{idx + 1}</div>
                        <div className="i-qa-body">
                          <p className="i-qa-question">{question}</p>
                          <div className="i-qa-answer-wrap">
                            <span className="i-qa-answer-label">Your Answer</span>
                            <p className="i-qa-answer">{selectedInterview.answers?.[idx] || "—"}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
