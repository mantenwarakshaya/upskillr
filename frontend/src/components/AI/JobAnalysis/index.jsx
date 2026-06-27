import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import {
  FaRocket,
  FaHistory,
  FaSpinner,
  FaSearch,
  FaArrowLeft,
  FaChartLine,
  FaRupeeSign,
  FaLightbulb,
  FaBriefcase,
  FaCoins,
  FaClipboardCheck,
  FaShieldAlt,
  FaExternalLinkAlt,
  FaBuilding,
  FaCheckCircle,
} from "react-icons/fa";
import { LoaderView, ErrorView } from "../../Common";
import "./index.css";

const API_BASE_URL = import.meta.env?.VITE_API_URL || "http://localhost:7777";

/* ─── Demand badge helper ────────────────────────────────────── */
function DemandBadge({ level }) {
  const map = {
    High:   "sj-demand--high",
    Medium: "sj-demand--mid",
    Low:    "sj-demand--low",
    Stable: "sj-demand--stable",
  };
  const cls = map[level] || "sj-demand--stable";
  return <span className={`sj-demand-badge ${cls}`}>{level || "Stable"} Demand</span>;
}

/* ─── Score Ring ─────────────────────────────────────────────── */
function ScoreRing({ value }) {
  const num = parseInt(value) || 0;
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ - (num / 100) * circ;
  const color = num >= 75 ? "var(--sj-green)" : num >= 50 ? "var(--sj-blue)" : "var(--sj-orange)";
  const label = num >= 75 ? "Strong Fit" : num >= 50 ? "Good Fit" : "Needs Work";

  return (
    <div className="sj-score-ring-wrap">
      <svg className="sj-score-svg" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} className="sj-ring-track" />
        <circle
          cx="60" cy="60" r={r}
          className="sj-ring-fill"
          style={{ strokeDasharray: circ, strokeDashoffset: offset, stroke: color }}
        />
        <text x="60" y="56" className="sj-ring-score">{num}%</text>
        <text x="60" y="72" className="sj-ring-sub">readiness</text>
      </svg>
      <span className="sj-ring-label" style={{ color }}>{label}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function JobMatch({ user }) {
  const [targetRole, setTargetRole]             = useState("");
  const [jobData, setJobData]                   = useState(null);
  const [mode, setMode]                         = useState("landing");
  const [isLoading, setIsLoading]               = useState(true);
  const [isStarting, setIsStarting]             = useState(false);
  const [hasPreviousAnalysis, setHasPreviousAnalysis] = useState(false);
  const [errorContext, setErrorContext]         = useState(null);
  const [toast, setToast]                       = useState("");

  const analysis        = jobData?.analysis || {};
  const activeJobsList  = useMemo(() => (Array.isArray(jobData?.jobs) ? jobData.jobs : []), [jobData?.jobs]);
  const readinessScore  = analysis?.jobReadinessScore ?? "--";

  /* ── helpers ─────────────────────────────────────────────── */
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  };

  const checkHistory = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/job-analysis/latest`, { withCredentials: true });
      setHasPreviousAnalysis(Boolean(res.data?.data));
    } catch {
      setHasPreviousAnalysis(false);
    }
  }, []);

  const restoreHistory = async () => {
    try {
      setIsStarting(true);
      const res = await axios.get(`${API_BASE_URL}/api/job-analysis/latest`, { withCredentials: true });
      const snap = res.data?.data;
      setJobData(snap);
      if (snap?.targetRole) setTargetRole(snap.targetRole);
      setMode("report");
      showToast("Previous analysis restored.");
    } catch {
      showToast("No previous analysis found.");
    } finally {
      setIsStarting(false);
    }
  };

  const runAnalysis = async (e) => {
    if (e) e.preventDefault();
    if (!targetRole.trim()) { alert("Please enter a target role."); return; }
    setIsStarting(true);
    setErrorContext(null);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/job-analysis`,
        { targetRole },
        { withCredentials: true }
      );
      const data = res.data?.data || res.data?.result || res.data || null;
      setJobData(data);
      await checkHistory();
      setMode("report");
    } catch (err) {
      setErrorContext({
        message: err.response?.data?.message || "Unable to complete market analysis.",
        status: err.response?.status,
      });
    } finally {
      setIsStarting(false);
    }
  };

  useEffect(() => {
    const init = async () => { await checkHistory(); setIsLoading(false); };
    init();
  }, [checkHistory]);

  /* ── early returns ───────────────────────────────────────── */
  if (isLoading) return <LoaderView message="Preparing market intelligence…" />;
  if (errorContext)
    return (
      <ErrorView
        message={errorContext.message}
        statusCode={errorContext.status}
        onRetry={() => { setErrorContext(null); setMode("landing"); }}
      />
    );

  /* ════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════ */
  return (
    <main className="sj-root">
      {toast && (
        <div className="sj-toast" role="alert">{toast}</div>
      )}

      {/* ══════════════  LANDING  ══════════════ */}
      {mode === "landing" && (
        <div className="sj-landing-layout">

          {/* Main */}
          <section className="sj-card sj-main-card">
            <span className="sj-eyebrow">Job Market Intelligence</span>
            <h1 className="sj-display-title">Market Suitability</h1>
            <p className="sj-lead">
              Compare your technical skills against real-time global hiring demand,
              salary structures, and live job listings.
            </p>

            <div className="sj-divider" />
            <p className="sj-section-label">Evaluation Workflow</p>

            <div className="sj-steps">
              {[
                { icon: <FaSearch />,     title: "Specify Your Role",      desc: "Enter your target job title or niche specialisation." },
                { icon: <FaChartLine />,  title: "Market Scan",            desc: "AI cross-references live hiring data and skill demand vectors." },
                { icon: <FaBriefcase />,  title: "Intelligence Report",    desc: "Review readiness score, salary insights, skill gaps, and open roles." },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="sj-step-row">
                  <div className="sj-step-circle">{icon}</div>
                  <div className="sj-step-body">
                    <strong>{title}</strong>
                    <span>{desc}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="sj-action-row">
              {hasPreviousAnalysis && (
                <button className="sj-btn sj-btn--ghost" onClick={restoreHistory} disabled={isStarting}>
                  {isStarting ? <FaSpinner className="sj-spin" /> : <FaHistory />}
                  Previous Analysis
                </button>
              )}
              <button className="sj-btn sj-btn--primary" onClick={() => setMode("search")}>
                <FaSearch /> Analyse a Role
              </button>
            </div>
          </section>

          {/* Sidebar */}
          <aside className="sj-card sj-sidebar-card">
            <p className="sj-section-label">Market Intelligence</p>
            <div className="sj-metrics-stack">
              {[
                { icon: <FaCoins />,        label: "Credits Available",  value: user?.aiUsage?.creditsRemaining ?? 0, accent: "blue"   },
                { icon: <FaClipboardCheck />, label: "Analysis Cost",    value: "4 credits",                           accent: "violet" },
                { icon: <FaShieldAlt />,    label: "Data Sources",       value: "Verified",                            accent: "green"  },
                { icon: <FaCheckCircle />,  label: "Engine Status",      value: "Live",                                accent: "green"  },
              ].map(({ icon, label, value, accent }) => (
                <div key={label} className={`sj-metric-tile sj-metric--${accent}`}>
                  <span className="sj-metric-icon">{icon}</span>
                  <div className="sj-metric-body">
                    <span className="sj-metric-label">{label}</span>
                    <strong className="sj-metric-value">{value}</strong>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      )}

      {/* ══════════════  SEARCH  ══════════════ */}
      {mode === "search" && (
        <div className="sj-single-layout">
          <section className="sj-card sj-full-card">
            <div className="sj-page-nav">
              <button className="sj-btn sj-btn--ghost sj-btn--sm" onClick={() => setMode("landing")}>
                <FaArrowLeft /> Back
              </button>
              <h2 className="sj-page-title">Configure Target Role</h2>
            </div>

            <form onSubmit={runAnalysis} className="sj-search-form">
              <label className="sj-search-label">
                Target role or specialisation
              </label>
              <div className="sj-search-row">
                <div className="sj-search-input-wrap">
                  <FaSearch className="sj-search-icon" />
                  <input
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. Senior Frontend Engineer, DevOps Engineer…"
                    className="sj-search-input"
                    required
                  />
                </div>
                <button type="submit" className="sj-btn sj-btn--primary" disabled={isStarting}>
                  {isStarting ? <FaSpinner className="sj-spin" /> : <FaRocket />}
                  {isStarting ? "Analysing…" : "Run Analysis"}
                </button>
              </div>
              <p className="sj-search-hint">
                Analysis uses 4 credits and scans live job boards + salary data.
              </p>
            </form>
          </section>
        </div>
      )}

      {/* ══════════════  REPORT  ══════════════ */}
      {mode === "report" && jobData && (
        <div className="sj-single-layout">
          <section className="sj-card sj-full-card">

            {/* Nav */}
            <div className="sj-page-nav">
              <button className="sj-btn sj-btn--ghost sj-btn--sm" onClick={() => setMode("landing")}>
                <FaArrowLeft /> Back
              </button>
              <h2 className="sj-page-title">Market Report — {targetRole}</h2>
            </div>

            {/* Hero */}
            <div className="sj-report-hero">
              <ScoreRing value={readinessScore} />
              <div className="sj-hero-meta">
                <span className="sj-eyebrow">Market Readiness</span>
                <h3 className="sj-hero-role">{targetRole}</h3>
                <p className="sj-hero-sub">
                  Cross-reference alignment score against current market demand and your skills profile.
                </p>
                <DemandBadge level={analysis?.demandLevel} />
              </div>
            </div>

            {/* Summary cards — 3 col */}
            <div className="sj-insight-grid">
              <div className="sj-insight-card">
                <div className="sj-insight-header sj-insight--blue">
                  <FaChartLine /> Market Summary
                </div>
                <p className="sj-insight-body">{analysis?.marketSummary || "—"}</p>
              </div>

              <div className="sj-insight-card">
                <div className="sj-insight-header sj-insight--green">
                  <FaRupeeSign /> Compensation
                </div>
                <p className="sj-insight-body">{analysis?.salaryInsights || "—"}</p>
              </div>

              <div className="sj-insight-card">
                <div className="sj-insight-header sj-insight--violet">
                  <FaRocket /> Role Outlook
                </div>
                <p className="sj-insight-body">{analysis?.futureOutlook || "—"}</p>
              </div>
            </div>

            {/* Skill gaps */}
            {Array.isArray(analysis?.skillGapForMarket) && analysis.skillGapForMarket.length > 0 && (
              <div className="sj-section">
                <div className="sj-section-header">
                  <FaLightbulb />
                  <h3>Skill Gaps & Core Competencies</h3>
                </div>
                <div className="sj-skills-grid">
                  {analysis.skillGapForMarket.map((skill, i) => (
                    <span key={i} className="sj-skill-pill">
                      <FaCheckCircle className="sj-skill-check" /> {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Job listings */}
            <div className="sj-section">
              <div className="sj-section-header">
                <FaBriefcase />
                <h3>
                  Matching Opportunities
                  <span className="sj-count-badge">{activeJobsList.length}</span>
                </h3>
              </div>

              {activeJobsList.length > 0 ? (
                <div className="sj-jobs-list">
                  {activeJobsList.map((job, idx) => (
                    <div key={job._id || idx} className="sj-job-card">
                      <div className="sj-job-icon-col">
                        <div className="sj-job-icon">
                          <FaBuilding />
                        </div>
                      </div>
                      <div className="sj-job-body">
                        <h4 className="sj-job-title">{job.title || "Open Position"}</h4>
                        <span className="sj-job-company">{job.company || "Confidential"}</span>
                        {job.location && <span className="sj-job-location">📍 {job.location}</span>}
                      </div>
                      {job.applyLink && (
                        <a
                          href={job.applyLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="sj-btn sj-btn--primary sj-btn--sm"
                        >
                          Apply <FaExternalLinkAlt style={{ fontSize: "10px" }} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="sj-empty-jobs">
                  <FaBriefcase className="sj-empty-icon" />
                  <p>No live listings found for this role right now. Check back soon.</p>
                </div>
              )}
            </div>

          </section>
        </div>
      )}
    </main>
  );
}
