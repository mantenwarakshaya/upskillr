import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  FaRocket,
  FaHistory,
  FaSpinner,
  FaCoins,
  FaFileAlt,
  FaChartLine,
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationTriangle,
  FaCloudUploadAlt,
  FaCode,
  FaBullseye,
  FaLightbulb,
  FaUserTie,
  FaClipboardList,
  FaCommentDots,
} from "react-icons/fa";
import { LoaderView } from "../../Common";
import { HistoryCard } from "../HistoryCard";
import "./index.css";

const API_BASE_URL = import.meta.env?.VITE_API_URL || "http://localhost:7777";

/* ─── Score Ring ─────────────────────────────────────────────── */
function ScoreRing({ score }) {
  const pct = Math.min(Math.max(score || 0, 0), 100);
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const color = pct >= 75 ? "var(--ra-green)" : pct >= 50 ? "var(--ra-blue)" : "var(--ra-orange)";
  const label = pct >= 75 ? "Strong Resume" : pct >= 50 ? "Good Shape" : "Needs Work";

  return (
    <div className="ra-score-ring-wrap">
      <svg className="ra-score-svg" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} className="ra-ring-track" />
        <circle
          cx="60" cy="60" r={r}
          className="ra-ring-fill"
          style={{ strokeDasharray: circ, strokeDashoffset: offset, stroke: color }}
        />
        <text x="60" y="56" className="ra-ring-score">{pct}</text>
        <text x="60" y="72" className="ra-ring-sub">/100</text>
      </svg>
      <span className="ra-ring-label" style={{ color }}>{label}</span>
    </div>
  );
}

/* ─── Upload Zone ────────────────────────────────────────────── */
function UploadZone({ selectedFile, onChange }) {
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onChange(file);
  };

  return (
    <div
      className={`ra-upload-zone ${dragging ? "ra-upload-zone--drag" : ""} ${selectedFile ? "ra-upload-zone--selected" : ""}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <label htmlFor="ra-file-input" className="ra-upload-label">
        {selectedFile ? (
          <>
            <FaFileAlt className="ra-upload-icon ra-upload-icon--active" />
            <span className="ra-upload-filename">{selectedFile.name}</span>
            <span className="ra-upload-hint">Click to replace</span>
          </>
        ) : (
          <>
            <FaCloudUploadAlt className="ra-upload-icon" />
            <span className="ra-upload-title">Drop your resume here</span>
            <span className="ra-upload-hint">PDF, DOC, DOCX — click to browse</span>
          </>
        )}
      </label>
      <input
        type="file"
        id="ra-file-input"
        accept=".pdf,.docx,.doc"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
        style={{ display: "none" }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function ResumeAnalysis({ user }) {
  const [history, setHistory]                   = useState([]);
  const [mode, setMode]                         = useState("landing");
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [selectedFile, setSelectedFile]         = useState(null);
  // targetRole is never edited here — read directly from the user prop
  // so it always reflects the latest /api/me response without any sync lag
  const targetRole = user?.targetRole || "";

  const [reportLoading, setReportLoading]       = useState(false);
  const [isLoading, setIsLoading]               = useState(true);
  const [isStarting, setIsStarting]             = useState(false);
  const [submitError, setSubmitError]           = useState("");

  const fetchHistory = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/resume/history`, { withCredentials: true });
      setHistory(res.data?.analyses || []);
    } catch (err) {
      console.error("Failed to fetch resume history:", err);
    }
  }, []);

  const fetchAnalysisReport = async (id) => {
    try {
      setReportLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/resume/${id}`, { withCredentials: true });
      setSelectedAnalysis(res.data.analysis);
      setMode("report");
    } catch {
      alert("Unable to load analysis report");
    } finally {
      setReportLoading(false);
    }
  };

  const handleStart = async () => {
    setSubmitError("");
    if (!selectedFile)  { setSubmitError("Please upload a resume file first."); return; }
    if (!targetRole.trim()) { setSubmitError("Please enter your target role before running analysis."); return; }
    setIsStarting(true);
    try {
      const formData = new FormData();
      formData.append("resume", selectedFile);
      formData.append("targetRole", targetRole.trim());
      // Do NOT set Content-Type manually — browser must auto-generate it
      // with the correct multipart boundary, otherwise the server can't
      // parse either the file or the text fields from the FormData body.
      await axios.post(`${API_BASE_URL}/api/resume/analyze`, formData, {
        withCredentials: true,
      });
      setSelectedFile(null);
      await fetchHistory();
      setMode("history");
    } catch (err) {
      // Surface the real server message so errors are debuggable
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to run resume analysis. Check the console for details.";
      setSubmitError(msg);
      console.error("Resume analysis error:", err?.response?.data || err);
    } finally {
      setIsStarting(false);
    }
  };

  useEffect(() => {
    const init = async () => { await fetchHistory(); setIsLoading(false); };
    init();
  }, [fetchHistory]);

  if (isLoading) return <LoaderView message="Preparing your resume analyser…" />;

  /* ─── derived stats ──────────────────────────────────────── */
  // FIX: backend stores score as aiAnalysis.overallScore, not aiAnalysis.score
  const completedAnalyses = history.filter((h) => h.aiAnalysis?.overallScore !== undefined);
  const avgScore = completedAnalyses.length
    ? Math.round(completedAnalyses.reduce((a, h) => a + (h.aiAnalysis?.overallScore || 0), 0) / completedAnalyses.length)
    : "--";

  /* ════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════ */
  return (
    <main className="ra-root">

      {/* ══════════════  LANDING  ══════════════ */}
      {mode === "landing" && (
        <div className="ra-landing-layout">

          {/* Main card */}
          <section className="ra-card ra-main-card">
            <span className="ra-eyebrow">AI Resume Analyser</span>
            <h1 className="ra-display-title">Resume Performance</h1>
            <p className="ra-lead">
              Upload your CV and get an ATS score, keyword gaps, structural
              improvements, and skill extraction — all in one pass.
            </p>

            <div className="ra-divider" />
            <p className="ra-section-label">Analysis Pipeline</p>

            <div className="ra-steps">
              {[
                { icon: <FaFileAlt />,   title: "Resume Parsing",       desc: "AI extracts your skills, experience, and structure from the document." },
                { icon: <FaBullseye />,  title: "ATS Scoring",          desc: "Your resume is scored against role-specific keyword requirements." },
                { icon: <FaLightbulb />, title: "Improvement Blueprint", desc: "Receive actionable suggestions to boost recruiter visibility and ATS rank." },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="ra-step-row">
                  <div className="ra-step-circle">{icon}</div>
                  <div className="ra-step-body">
                    <strong>{title}</strong>
                    <span>{desc}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Target Role — read from user profile via /api/me */}
            <div className="ra-field-group">
              <span className="ra-section-label">Analysing for role</span>
              {targetRole ? (
                <div className="ra-role-display">
                  <FaBullseye className="ra-role-icon" />
                  <span className="ra-role-name">{targetRole}</span>
                  <span className="ra-role-source">from your profile</span>
                </div>
              ) : (
                <div className="ra-role-missing">
                  <FaExclamationTriangle />
                  No target role set — go to <strong>Profile Settings</strong> to add one.
                </div>
              )}
            </div>

            {/* Upload */}
            <UploadZone selectedFile={selectedFile} onChange={setSelectedFile} />

            {/* Inline error — replaces browser alert() */}
            {submitError && (
              <div className="ra-submit-error">
                <FaExclamationTriangle /> {submitError}
              </div>
            )}

            <div className="ra-action-row">
              {history.length > 0 && (
                <button className="ra-btn ra-btn--ghost" onClick={() => setMode("history")}>
                  <FaHistory /> Previous Analyses
                </button>
              )}
              <button
                className="ra-btn ra-btn--primary"
                onClick={handleStart}
                disabled={isStarting || !selectedFile || !targetRole}
              >
                {isStarting ? <FaSpinner className="ra-spin" /> : <FaRocket />}
                {isStarting ? "Processing…" : "Run Analysis"}
              </button>
            </div>
          </section>

          {/* Sidebar */}
          <aside className="ra-card ra-sidebar-card">
            <p className="ra-section-label">System Metrics</p>
            <div className="ra-metrics-stack">
              {[
                { icon: <FaCoins />,       label: "Credits Available", value: user?.aiUsage?.creditsRemaining ?? 0, accent: "blue"   },
                { icon: <FaFileAlt />,     label: "Total Submissions",  value: history.length,                      accent: "violet" },
                { icon: <FaChartLine />,   label: "Average ATS Score",  value: avgScore,                            accent: "green"  },
                { icon: <FaCheckCircle />, label: "Scanner Status",     value: "Active",                            accent: "green"  },
              ].map(({ icon, label, value, accent }) => (
                <div key={label} className={`ra-metric-tile ra-metric--${accent}`}>
                  <span className="ra-metric-icon">{icon}</span>
                  <div className="ra-metric-body">
                    <span className="ra-metric-label">{label}</span>
                    <strong className="ra-metric-value">{value}</strong>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      )}

      {/* ══════════════  HISTORY  ══════════════ */}
      {mode === "history" && (
        <div className="ra-single-layout">
          <section className="ra-card ra-full-card">
            <div className="ra-page-nav">
              <button className="ra-btn ra-btn--ghost ra-btn--sm" onClick={() => setMode("landing")}>
                <FaArrowLeft /> Back
              </button>
              <h2 className="ra-page-title">Analysis Records</h2>
            </div>

            {history.length === 0 ? (
              <div className="ra-empty-state">
                <FaFileAlt className="ra-empty-icon" />
                <p>No analyses yet. Upload your resume to get started.</p>
              </div>
            ) : (
              <div className="ra-history-list">
                {history.map((item) => {
                  // FIX: use overallScore — the field the backend actually saves
                  const score = item.aiAnalysis?.overallScore ?? 0;
                  const scoreClass = score >= 75 ? "hc-score--high" : score >= 50 ? "hc-score--mid" : "hc-score--low";

                  return (
                    <HistoryCard
                      key={item._id}
                      score={score}
                      scoreClass={scoreClass}
                      label={item.targetRole || "General Scan"}
                      date={new Date(item.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                      onClick={() => fetchAnalysisReport(item._id)}
                      isLoading={reportLoading}
                    />
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}

      {/* ══════════════  REPORT  ══════════════ */}
      {mode === "report" && selectedAnalysis && (
        <div className="ra-single-layout">
          <section className="ra-card ra-full-card">

            <div className="ra-page-nav">
              <button className="ra-btn ra-btn--ghost ra-btn--sm" onClick={() => setMode("history")}>
                <FaArrowLeft /> Back
              </button>
              <h2 className="ra-page-title">
                {selectedAnalysis.targetRole || "Resume"} — Analysis Report
              </h2>
            </div>

            {reportLoading ? (
              <LoaderView message="Loading report…" />
            ) : (
              <>
                {/* ── Hero ── */}
                <div className="ra-report-hero">
                  {/* FIX: overallScore is the correct field from backend */}
                  <ScoreRing score={selectedAnalysis.aiAnalysis?.overallScore ?? 0} />

                  <div className="ra-hero-meta">
                    <span className="ra-eyebrow">ATS Match Score</span>
                    <h3 className="ra-hero-role">
                      {selectedAnalysis.targetRole || "Resume Assessment"}
                    </h3>
                    <p className="ra-hero-sub">
                      Analysed on{" "}
                      {new Date(selectedAnalysis.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric", month: "long", year: "numeric",
                      })}
                    </p>
                    <div className="ra-hero-chips">
                      {/* FIX: candidateLevel comes from aiAnalysis, not a top-level field */}
                      {selectedAnalysis.aiAnalysis?.candidateLevel && (
                        <span className="ra-chip">
                          <FaUserTie /> {selectedAnalysis.aiAnalysis.candidateLevel}
                        </span>
                      )}
                      {selectedAnalysis.extractedSkills?.length > 0 && (
                        <span className="ra-chip">
                          <FaCode /> {selectedAnalysis.extractedSkills.length} skills found
                        </span>
                      )}
                      {/* FIX: interviewReadiness — new field now surfaced */}
                      {selectedAnalysis.aiAnalysis?.interviewReadiness && (
                        <span className="ra-chip ra-chip--readiness">
                          <FaCheckCircle /> {selectedAnalysis.aiAnalysis.interviewReadiness}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* FIX: summary field is correct key, was already right */}
                  {selectedAnalysis.aiAnalysis?.summary && (
                    <div className="ra-summary-box">
                      <p className="ra-section-label" style={{ marginBottom: "8px" }}>AI Summary</p>
                      <p className="ra-summary-text">{selectedAnalysis.aiAnalysis.summary}</p>
                    </div>
                  )}
                </div>

                {/* ── Strengths + Weaknesses ── */}
                <div className="ra-two-col">
                  <div className="ra-panel">
                    <div className="ra-panel-header ra-panel--green">
                      <FaCheckCircle /> Identified Strengths
                    </div>
                    <ul className="ra-feedback-list">
                      {/* FIX: field is aiAnalysis.strengths — was already correct */}
                      {(selectedAnalysis.aiAnalysis?.strengths || []).map((item, i) => (
                        <li key={i}>
                          <span className="ra-dot ra-dot--green">✓</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="ra-panel">
                    <div className="ra-panel-header ra-panel--orange">
                      <FaExclamationTriangle /> Areas to Improve
                    </div>
                    <ul className="ra-feedback-list">
                      {/* FIX: backend sends "weaknesses", not "improvements" */}
                      {(selectedAnalysis.aiAnalysis?.weaknesses || []).map((item, i) => (
                        <li key={i}>
                          <span className="ra-dot ra-dot--orange">→</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* ── Resume Feedback ── NEW: was completely missing */}
                {selectedAnalysis.aiAnalysis?.resumeFeedback?.length > 0 && (
                  <div className="ra-section">
                    <div className="ra-section-header">
                      <FaClipboardList />
                      <h3>Resume Feedback</h3>
                      <span className="ra-count-badge">
                        {selectedAnalysis.aiAnalysis.resumeFeedback.length}
                      </span>
                    </div>
                    <ul className="ra-feedback-list ra-feedback-list--bordered">
                      {selectedAnalysis.aiAnalysis.resumeFeedback.map((tip, i) => (
                        <li key={i}>
                          <span className="ra-dot ra-dot--blue">{i + 1}</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* ── Project Evaluation ── NEW: was completely missing */}
                {selectedAnalysis.aiAnalysis?.projectEvaluation && (
                  <div className="ra-section">
                    <div className="ra-section-header">
                      <FaCommentDots />
                      <h3>Project Evaluation</h3>
                    </div>
                    <div className="ra-prose-box">
                      <p>{selectedAnalysis.aiAnalysis.projectEvaluation}</p>
                    </div>
                  </div>
                )}

                {/* ── Extracted Skills ── */}
                {selectedAnalysis.extractedSkills?.length > 0 && (
                  <div className="ra-section">
                    <div className="ra-section-header">
                      <FaCode />
                      <h3>Extracted Skills</h3>
                      <span className="ra-count-badge">{selectedAnalysis.extractedSkills.length}</span>
                    </div>
                    <div className="ra-skills-grid">
                      {selectedAnalysis.extractedSkills.map((skill, i) => (
                        <span key={i} className="ra-skill-pill">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
