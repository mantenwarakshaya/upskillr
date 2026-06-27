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
  FaRegClock,
  FaCode,
  FaBullseye,
  FaLightbulb,
} from "react-icons/fa";
import { LoaderView } from "../../Common";
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
  const [reportLoading, setReportLoading]       = useState(false);
  const [isLoading, setIsLoading]               = useState(true);
  const [isStarting, setIsStarting]             = useState(false);

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
    if (!selectedFile) { alert("Please upload a resume file first."); return; }
    setIsStarting(true);
    try {
      const formData = new FormData();
      formData.append("resume", selectedFile);
      formData.append("role", user?.targetRole || "");
      await axios.post(`${API_BASE_URL}/api/resume/analyze`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      setSelectedFile(null);
      await fetchHistory();
      setMode("history");
    } catch {
      alert("Unable to run resume analysis");
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
  const completedAnalyses = history.filter((h) => h.aiAnalysis?.score !== undefined);
  const avgScore = completedAnalyses.length
    ? Math.round(completedAnalyses.reduce((a, h) => a + (h.aiAnalysis?.score || 0), 0) / completedAnalyses.length)
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

            {/* Upload */}
            <UploadZone selectedFile={selectedFile} onChange={setSelectedFile} />

            <div className="ra-action-row">
              {history.length > 0 && (
                <button className="ra-btn ra-btn--ghost" onClick={() => setMode("history")}>
                  <FaHistory /> Previous Analyses
                </button>
              )}
              <button
                className="ra-btn ra-btn--primary"
                onClick={handleStart}
                disabled={isStarting || !selectedFile}
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
                { icon: <FaCoins />,     label: "Credits Available",  value: user?.aiUsage?.creditsRemaining ?? 0, accent: "blue"   },
                { icon: <FaFileAlt />,   label: "Total Submissions",  value: history.length,                        accent: "violet" },
                { icon: <FaChartLine />, label: "Average ATS Score",  value: avgScore,                              accent: "green"  },
                { icon: <FaCheckCircle />, label: "Scanner Status",   value: "Active",                              accent: "green"  },
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
                  const score = item.aiAnalysis?.score ?? item.feedback?.score ?? 0;
                  const scoreClass = score >= 75 ? "ra-score--high" : score >= 50 ? "ra-score--mid" : "ra-score--low";
                  return (
                    <div key={item._id} className="ra-session-card">
                      <div className="ra-session-left">
                        <div className={`ra-session-score ${scoreClass}`}>
                          {score}<span>/100</span>
                        </div>
                        <div className="ra-session-meta">
                          <strong className="ra-session-role">
                            {item.targetRole || item.role || "General Scan"}
                          </strong>
                          <span className="ra-session-date">
                            <FaRegClock />
                            {new Date(item.createdAt).toLocaleDateString("en-GB", {
                              day: "numeric", month: "short", year: "numeric",
                            })}
                          </span>
                          {item.extractedSkills?.length > 0 && (
                            <span className="ra-session-skills-count">
                              <FaCode /> {item.extractedSkills.length} skills extracted
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        className="ra-btn ra-btn--primary ra-btn--sm"
                        onClick={() => fetchAnalysisReport(item._id)}
                        disabled={reportLoading}
                      >
                        {reportLoading ? <FaSpinner className="ra-spin" /> : null}
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
      {mode === "report" && selectedAnalysis && (
        <div className="ra-single-layout">
          <section className="ra-card ra-full-card">

            <div className="ra-page-nav">
              <button className="ra-btn ra-btn--ghost ra-btn--sm" onClick={() => setMode("history")}>
                <FaArrowLeft /> Back
              </button>
              <h2 className="ra-page-title">
                {selectedAnalysis.targetRole || selectedAnalysis.role || "Resume"} — Analysis Report
              </h2>
            </div>

            {reportLoading ? (
              <LoaderView message="Loading report…" />
            ) : (
              <>
                {/* Hero */}
                <div className="ra-report-hero">
                  <ScoreRing score={selectedAnalysis.aiAnalysis?.score ?? selectedAnalysis.feedback?.score ?? 0} />
                  <div className="ra-hero-meta">
                    <span className="ra-eyebrow">ATS Match Score</span>
                    <h3 className="ra-hero-role">
                      {selectedAnalysis.targetRole || selectedAnalysis.role || "Resume Assessment"}
                    </h3>
                    <p className="ra-hero-sub">
                      Analysed on{" "}
                      {new Date(selectedAnalysis.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric", month: "long", year: "numeric",
                      })}
                    </p>
                    <div className="ra-hero-chips">
                      {selectedAnalysis.extractedSkills?.length > 0 && (
                        <span className="ra-chip">
                          <FaCode /> {selectedAnalysis.extractedSkills.length} skills found
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Summary inset */}
                  {selectedAnalysis.aiAnalysis?.summary && (
                    <div className="ra-summary-box">
                      <p className="ra-section-label" style={{ marginBottom: "8px" }}>Summary</p>
                      <p className="ra-summary-text">{selectedAnalysis.aiAnalysis.summary}</p>
                    </div>
                  )}
                </div>

                {/* Strengths + Improvements */}
                <div className="ra-two-col">
                  <div className="ra-panel">
                    <div className="ra-panel-header ra-panel--green">
                      <FaCheckCircle /> Identified Strengths
                    </div>
                    <ul className="ra-feedback-list">
                      {(selectedAnalysis.aiAnalysis?.strengths || selectedAnalysis.feedback?.strengths || []).map((item, i) => (
                        <li key={i}>
                          <span className="ra-dot ra-dot--green">✓</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="ra-panel">
                    <div className="ra-panel-header ra-panel--orange">
                      <FaExclamationTriangle /> Improvements Needed
                    </div>
                    <ul className="ra-feedback-list">
                      {(selectedAnalysis.aiAnalysis?.improvements || selectedAnalysis.feedback?.improvements || []).map((item, i) => (
                        <li key={i}>
                          <span className="ra-dot ra-dot--orange">→</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Extracted Skills */}
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

                {/* Section diagnostics */}
                {selectedAnalysis.questions?.length > 0 && (
                  <div className="ra-section">
                    <div className="ra-section-header">
                      <FaLightbulb />
                      <h3>Section Diagnostics</h3>
                    </div>
                    <div className="ra-diagnostics-list">
                      {selectedAnalysis.questions.map((section, idx) => (
                        <div key={idx} className="ra-diagnostic-card">
                          <div className="ra-diagnostic-number">S{idx + 1}</div>
                          <div className="ra-diagnostic-body">
                            <p className="ra-diagnostic-title">{section}</p>
                            {selectedAnalysis.answers?.[idx] && (
                              <div className="ra-diagnostic-rec">
                                <span className="ra-rec-label">Recommendation</span>
                                <p className="ra-rec-text">{selectedAnalysis.answers[idx]}</p>
                              </div>
                            )}
                          </div>
                        </div>
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
