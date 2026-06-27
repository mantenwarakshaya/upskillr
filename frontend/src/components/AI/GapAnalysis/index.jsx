import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  FaRocket,
  FaArrowLeft,
  FaSpinner,
  FaChartLine,
  FaCheckCircle,
  FaExclamationTriangle,
  FaLaptopCode,
  FaBrain,
  FaLayerGroup,
  FaClipboardCheck,
  FaMicrophone,
} from "react-icons/fa";

import { LoaderView, ErrorView, EmptyView } from "../../Common";
import "./index.css";

const API_BASE_URL = import.meta.env?.VITE_API_URL || "http://localhost:7777";

/* ─── tiny helper ─────────────────────────────────────────────── */
function ScoreRing({ value }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  const color =
    value >= 75 ? "var(--success)" : value >= 50 ? "var(--warning)" : "var(--danger)";

  return (
    <svg className="ga-score-ring" viewBox="0 0 120 120">
      <circle cx="60" cy="60" r={r} className="ga-ring-track" />
      <circle
        cx="60"
        cy="60"
        r={r}
        className="ga-ring-fill"
        style={{
          strokeDasharray: circ,
          strokeDashoffset: offset,
          stroke: color,
        }}
      />
      <text x="60" y="65" className="ga-ring-text">
        {value ?? "--"}%
      </text>
    </svg>
  );
}

/* ─── main component ──────────────────────────────────────────── */
export default function GapAnalysis() {
  const [roadmap, setRoadmap] = useState(null);
  const [mode, setMode] = useState("landing");
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState(null);

  const loadRoadmap = useCallback(async () => {
    try {
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/api/gap-analysis/latest`, {
        withCredentials: true,
      });
      const data = response.data?.data || response.data?.roadmap || response.data;
      if (data) setRoadmap(data);
    } catch (err) {
      if (err.response?.status !== 404) {
        setError({
          message: err.response?.data?.message || "Unable to load skill gap analysis.",
          status: err.response?.status,
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const generateAnalysis = async () => {
    try {
      setStarting(true);
      await axios.get(`${API_BASE_URL}/api/gap-analysis`, { withCredentials: true });
      await loadRoadmap();
      setMode("report");
    } catch (err) {
      alert(err.response?.data?.message || "Unable to generate analysis.");
    } finally {
      setStarting(false);
    }
  };

  useEffect(() => {
    loadRoadmap();
  }, [loadRoadmap]);

  if (loading) return <LoaderView message="Preparing your skill gap analysis…" />;
  if (error)
    return (
      <ErrorView message={error.message} statusCode={error.status} onRetry={loadRoadmap} />
    );

  /* ─── score colour helper ──────────────────────────────────── */
  const scoreClass =
    (roadmap?.matchPercentage ?? 0) >= 75
      ? "ga-score--high"
      : (roadmap?.matchPercentage ?? 0) >= 50
      ? "ga-score--mid"
      : "ga-score--low";

  /* ════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════ */
  return (
    <main className="ga-root">

      {/* ══════════════  LANDING  ══════════════ */}
      {mode === "landing" && (
        <div className="ga-landing-layout">

          {/* Left — main card */}
          <section className="ga-card ga-main-card">
            <span className="ga-eyebrow">AI Career Intelligence</span>
            <h1 className="ga-display-title">Skill Gap Analysis</h1>
            <p className="ga-lead">
              Compare your skills with your target role, discover missing
              technologies, and receive a personalised roadmap to become job-ready.
            </p>

            <div className="ga-steps-section">
              <p className="ga-section-label">Analysis Workflow</p>

              {[
                {
                  step: "01",
                  title: "Resume Evaluation",
                  desc: "AI reads your resume and maps your current technical profile.",
                },
                {
                  step: "02",
                  title: "Skill Comparison",
                  desc: "Your profile is matched against live industry requirements.",
                },
                {
                  step: "03",
                  title: "Personalised Roadmap",
                  desc:
                    "Receive phased milestones, projects, interview prep, and resume tips.",
                },
              ].map(({ step, title, desc }) => (
                <div key={step} className="ga-step-row">
                  <span className="ga-step-badge">Step {step}</span>
                  <div className="ga-step-body">
                    <strong>{title}</strong>
                    <span>{desc}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="ga-action-row">
              {roadmap?.matchPercentage !== undefined && (
                <button className="ga-btn ga-btn--ghost" onClick={() => setMode("report")}>
                  View Previous Analysis
                </button>
              )}
              <button
                className="ga-btn ga-btn--primary"
                onClick={generateAnalysis}
                disabled={starting}
              >
                {starting ? (
                  <FaSpinner className="ga-spin" />
                ) : (
                  <FaRocket />
                )}
                {starting ? "Generating…" : "Generate Analysis"}
              </button>
            </div>
          </section>

          {/* Right — sidebar */}
          <aside className="ga-card ga-sidebar-card">
            <p className="ga-section-label">Analysis Insights</p>
            <div className="ga-metrics-stack">
              {[
                {
                  icon: <FaChartLine />,
                  label: "Match Score",
                  value: `${roadmap?.matchPercentage ?? "--"}%`,
                  accent: "blue",
                },
                {
                  icon: <FaExclamationTriangle />,
                  label: "Missing Skills",
                  value: roadmap?.missingSkills?.length ?? 0,
                  accent: "orange",
                },
                {
                  icon: <FaLaptopCode />,
                  label: "Roadmap Phases",
                  value: roadmap?.milestones?.length ?? 0,
                  accent: "violet",
                },
                {
                  icon: <FaCheckCircle />,
                  label: "AI Status",
                  value: "Ready",
                  accent: "green",
                },
              ].map(({ icon, label, value, accent }) => (
                <div key={label} className={`ga-metric-tile ga-metric--${accent}`}>
                  <span className="ga-metric-icon">{icon}</span>
                  <div className="ga-metric-body">
                    <span className="ga-metric-label">{label}</span>
                    <strong className="ga-metric-value">{value}</strong>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      )}

      {/* ══════════════  REPORT  ══════════════ */}
      {mode === "report" && (
        <div className="ga-report-layout">
          <section className="ga-card ga-report-card">

            {/* ── Nav bar ── */}
            <div className="ga-report-nav">
              <button className="ga-btn ga-btn--ghost ga-btn--sm" onClick={() => setMode("landing")}>
                <FaArrowLeft /> Back
              </button>
              <h2 className="ga-report-title">Skill Gap Analysis Report</h2>
            </div>

            {!roadmap ? (
              <EmptyView
                title="No Analysis Available"
                message="Generate your first analysis to view your personalised roadmap."
              />
            ) : (
              <>
                {/* ── Hero banner ── */}
                <div className="ga-hero-banner">
                  <div className="ga-hero-ring-wrap">
                    <ScoreRing value={roadmap.matchPercentage} />
                    <span className="ga-hero-ring-label">Match Score</span>
                  </div>
                  <div className="ga-hero-meta">
                    <span className="ga-eyebrow">Target Role</span>
                    <h3 className="ga-hero-role">{roadmap.targetRole || "—"}</h3>
                    <p className="ga-hero-sub">
                      Personalised roadmap built from your resume, current skills
                      and target job role.
                    </p>
                    <div className="ga-hero-chips">
                      <span className="ga-chip">
                        ⏱ {roadmap.totalEstimatedDuration || "Flexible"}
                      </span>
                      <span className="ga-chip">
                        🗺 {roadmap.milestones?.length ?? 0} Milestones
                      </span>
                      <span className={`ga-chip ga-chip--score ${scoreClass}`}>
                        {roadmap.matchPercentage ?? "--"}% Ready
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── Strengths + Gaps ── */}
                <div className="ga-two-col">
                  <div className="ga-panel">
                    <div className="ga-panel-header ga-panel-header--green">
                      <FaCheckCircle /> Strengths
                    </div>
                    <div className="ga-pill-wrap">
                      {roadmap.strengths?.length ? (
                        roadmap.strengths.map((s, i) => (
                          <span key={i} className="ga-pill ga-pill--green">{s}</span>
                        ))
                      ) : (
                        <p className="ga-empty-note">None detected.</p>
                      )}
                    </div>
                  </div>

                  <div className="ga-panel">
                    <div className="ga-panel-header ga-panel-header--orange">
                      <FaExclamationTriangle /> Missing Skills
                    </div>
                    <div className="ga-pill-wrap">
                      {roadmap.missingSkills?.length ? (
                        roadmap.missingSkills.map((s, i) => (
                          <span key={i} className="ga-pill ga-pill--orange">{s}</span>
                        ))
                      ) : (
                        <p className="ga-empty-note">No gaps found — great shape!</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Learning Roadmap ── */}
                <div className="ga-section">
                  <div className="ga-section-header">
                    <FaLayerGroup />
                    <h3>Learning Roadmap</h3>
                  </div>

                  <div className="ga-phases-list">
                    {roadmap.milestones?.map((phase, idx) => (
                      <div key={phase._id || idx} className="ga-phase-card">
                        <div className="ga-phase-top">
                          <div className="ga-phase-index-col">
                            <span className="ga-phase-number">Phase {idx + 1}</span>
                            <span className="ga-phase-duration">{phase.duration}</span>
                          </div>
                          <div className="ga-phase-headline">
                            <h4 className="ga-phase-name">{phase.phase}</h4>
                            <p className="ga-phase-obj">{phase.objective}</p>
                          </div>
                        </div>

                        <div className="ga-phase-body">
                          {phase.skills?.length > 0 && (
                            <div className="ga-phase-group">
                              <span className="ga-group-label">Skills</span>
                              <div className="ga-pill-wrap">
                                {phase.skills.map((s, i) => (
                                  <span key={i} className="ga-pill ga-pill--blue">{s}</span>
                                ))}
                              </div>
                            </div>
                          )}

                          {phase.topics?.length > 0 && (
                            <div className="ga-phase-group">
                              <span className="ga-group-label">Topics</span>
                              <div className="ga-pill-wrap">
                                {phase.topics.map((t, i) => (
                                  <span key={i} className="ga-pill">{t}</span>
                                ))}
                              </div>
                            </div>
                          )}

                          {phase.projects?.length > 0 && (
                            <div className="ga-phase-group">
                              <span className="ga-group-label">Practice Projects</span>
                              <div className="ga-projects-grid">
                                {phase.projects.map((proj, i) => (
                                  <div key={i} className="ga-project-tile">
                                    <span className={`ga-diff-badge ga-diff--${(proj.difficulty || "Intermediate").toLowerCase()}`}>
                                      {proj.difficulty || "Intermediate"}
                                    </span>
                                    <h5 className="ga-project-title">{proj.title}</h5>
                                    <p className="ga-project-desc">{proj.description}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Capstone ── */}
                {roadmap.capstoneProject?.title && (
                  <div className="ga-section">
                    <div className="ga-section-header">
                      <FaBrain />
                      <h3>Capstone Project</h3>
                    </div>
                    <div className="ga-capstone-card">
                      <h4 className="ga-capstone-title">{roadmap.capstoneProject.title}</h4>
                      <p className="ga-capstone-desc">{roadmap.capstoneProject.description}</p>
                      {roadmap.capstoneProject.skillsCovered?.length > 0 && (
                        <div className="ga-pill-wrap ga-pill-wrap--mt">
                          {roadmap.capstoneProject.skillsCovered.map((s, i) => (
                            <span key={i} className="ga-pill ga-pill--violet">{s}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── Resume + Interview ── */}
                <div className="ga-two-col">
                  <div className="ga-panel">
                    <div className="ga-panel-header ga-panel-header--blue">
                      <FaClipboardCheck /> Resume Improvements
                    </div>
                    <ul className="ga-check-list">
                      {roadmap.jobPreparation?.resumeChecklist?.map((item, i) => (
                        <li key={i}>
                          <span className="ga-check-icon">✓</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="ga-panel">
                    <div className="ga-panel-header ga-panel-header--violet">
                      <FaMicrophone /> Interview Topics
                    </div>
                    <ul className="ga-check-list">
                      {roadmap.jobPreparation?.interviewTopics?.map((item, i) => (
                        <li key={i}>
                          <span className="ga-check-icon">✓</span>
                          {item}
                        </li>
                      ))}
                    </ul>
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
