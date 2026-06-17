import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaArrowLeft,
  FaBriefcase,
  FaChartLine,
  FaLightbulb,
  FaRedo,
  FaRocket,
  FaRupeeSign,
  FaSearch,
  FaSpinner,
  FaInfoCircle,
  FaLevelUpAlt,
  FaWallet,
  FaLink,
  FaShieldAlt,
  FaDatabase,
  FaClock
} from "react-icons/fa";
import { LoaderView, ErrorView, EmptyView } from "../../Common";
import "./index.css";

const API_BASE_URL = import.meta.env?.VITE_API_URL || "http://localhost:7777";

export default function JobMatch() {
  const navigate = useNavigate();

  const [targetRole, setTargetRole] = useState("");
  const [jobData, setJobData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [errorContext, setErrorContext] = useState(null);
  const [notification, setNotification] = useState("");

  const [showSearchForm, setShowSearchForm] = useState(false);
  const [hasPreviousAnalysis, setHasPreviousAnalysis] = useState(false);
  const [mode, setMode] = useState(null);

  const analysis = jobData?.analysis || {};
  const activeJobsList = useMemo(
    () => (Array.isArray(jobData?.jobs) ? jobData.jobs : []),
    [jobData?.jobs]
  );
  const alignmentQuotient = analysis?.jobReadinessScore ?? "--";

  const executeJobMarketAnalysis = async (roleOverride) => {
    const activeRole = roleOverride || targetRole;

    if (!activeRole.trim()) {
      setNotification("Enter a target role to continue.");
      return;
    }

    try {
      setIsLoading(true);
      setErrorContext(null);
      setNotification("");

      const response = await axios.post(
        `${API_BASE_URL}/api/job-analysis`,
        { targetRole: activeRole },
        { withCredentials: true }
      );

      const dataset =
        response.data?.data || response.data?.result || response.data || null;

      setJobData(dataset);
      setNotification("Market analysis updated.");
    } catch (err) {
      setErrorContext({
        message:
          err.response?.data?.message ||
          "Unable to complete the job market analysis.",
        status: err.response?.status
      });
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false);
    }
  };

  const checkAnalyticalHistory = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/job-analysis/latest`, {
        withCredentials: true
      });

      setHasPreviousAnalysis(Boolean(response.data?.data));
    } catch {
      setHasPreviousAnalysis(false);
    }
  }, []);

  const restoreHistoricalAnalysis = async () => {
    try {
      setIsLoading(true);
      setErrorContext(null);
      setMode("restore");

      const response = await axios.get(`${API_BASE_URL}/api/job-analysis/latest`, {
        withCredentials: true
      });

      const snapshot = response.data?.data;
      setJobData(snapshot);

      if (snapshot?.targetRole) {
        setTargetRole(snapshot.targetRole);
      }

      setShowSearchForm(false);
    } catch {
      setNotification("No previous analysis could be restored.");
      setMode(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (jobData || showSearchForm) {
      setJobData(null);
      setShowSearchForm(false);
      setTargetRole("");
      setMode(null);
      return;
    }

    navigate("/dashboard");
  };

  useEffect(() => {
    checkAnalyticalHistory();
  }, [checkAnalyticalHistory]);

  useEffect(() => {
    if (targetRole) {
      window.localStorage.setItem("upskillrTargetRole", targetRole);
    }
  }, [targetRole]);

  useEffect(() => {
    if (!notification) return;

    const timer = setTimeout(() => setNotification(""), 4000);
    return () => clearTimeout(timer);
  }, [notification]);

  if (isInitialLoading) {
    return <LoaderView message="Loading job market analysis..." />;
  }

  if (errorContext) {
    return (
      <ErrorView
        message={errorContext.message}
        statusCode={errorContext.status}
        onRetry={() => executeJobMarketAnalysis()}
      />
    );
  }

  return (
    <main className="j-job-intel-workspace">
      <div className="j-job-grid-shell">
        {notification && (
          <div className="j-job-toast-notification" role="alert" aria-live="polite">
            <span>{notification}</span>
          </div>
        )}

        <header className="j-job-control-bar">
          <div className="j-bar-interactive-left">
            <button
              type="button"
              className="j-job-action-icon-btn"
              onClick={handleBack}
              aria-label="Go back"
            >
              <FaArrowLeft />
            </button>

            <div className="j-bar-title-hierarchy">
              <h1>Job Market Intelligence</h1>
              <p className="j-timestamp-echo">
                Review demand, compensation, skill gaps, and matching roles.
              </p>
            </div>
          </div>
        </header>

        {/* 1. STATE DISPATCHER: IMMERSIVE INTEGRATED SPLIT ONBOARDING */}
        {!showSearchForm && !jobData && (
          <div className="j-split-onboarding-container">
            {/* Left Operational Segment */}
            <section className="j-onboarding-main-card">
              <div className="j-onboarding-text-lockup">
                <span className="j-sys-badge-accent">Market Analytics</span>
                <h2>Understand your role fit</h2>
                <p>
                  Compare your baseline technical competencies against global tech hiring demand,
                  compensation patterns, real-time skill expectations, and live openings.
                </p>

                {/* Expanded Content: Analysis Sequence Timeline */}
                <div className="j-onboarding-process-timeline">
                  <h4 className="j-timeline-section-title">Evaluation Sequence</h4>
                  <div className="j-timeline-steps">
                    <div className="j-timeline-step">
                      <div className="j-step-badge">1</div>
                      <div className="j-step-content">
                        <h5>Specify Context</h5>
                        <p>Provide your exact intended corporate title or industrial niche target.</p>
                      </div>
                    </div>
                    <div className="j-timeline-step">
                      <div className="j-step-badge">2</div>
                      <div className="j-step-content">
                        <h5>Semantic Mapping</h5>
                        <p>The engine matches profile indicators with live aggregator requirements.</p>
                      </div>
                    </div>
                    <div className="j-timeline-step">
                      <div className="j-step-badge">3</div>
                      <div className="j-step-content">
                        <h5>Intelligence Generation</h5>
                        <p>Receive data structural charts detailing clear pay curves and skill actions.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="j-horizontal-actions">
                {hasPreviousAnalysis && (
                  <button
                    type="button"
                    className="j-job-btn j-job-btn-secondary"
                    onClick={restoreHistoricalAnalysis}
                    disabled={isLoading}
                  >
                    <FaRedo className={isLoading ? "j-spin-engine" : ""} />
                    <span>Restore Last Analysis</span>
                  </button>
                )}

                <button
                  type="button"
                  className="j-job-btn j-job-btn-primary"
                  onClick={() => {
                    setShowSearchForm(true);
                    setMode("new");
                  }}
                >
                  <FaSearch />
                  <span>Configure Target Analysis</span>
                </button>
              </div>
            </section>

            {/* Right Informational Segment */}
            <aside className="j-onboarding-sidebar-card">
              <h3>
                <FaInfoCircle className="j-sidebar-title-icon" />
                <span>Analytical Vectors</span>
              </h3>
              <p className="j-sidebar-intro">Running this evaluation correlates profile metadata to real-world employment points:</p>
              
              <ul className="j-sidebar-feature-list">
                <li>
                  <FaLevelUpAlt className="j-feat-icon" />
                  <div>
                    <strong>Market Readiness Index</strong>
                    <p>A statistical score showing how closely matching your profile text is to open role requisitions.</p>
                  </div>
                </li>
                <li>
                  <FaWallet className="j-feat-icon" />
                  <div>
                    <strong>Salary Benchmarks</strong>
                    <p>Aggregated local compensation curves parsed directly across current job listings.</p>
                  </div>
                </li>
                <li>
                  <FaLink className="j-feat-icon" />
                  <div>
                    <strong>Direct Openings</strong>
                    <p>Curated external pipeline connections providing quick submission targets matching your skills.</p>
                  </div>
                </li>
              </ul>

              {/* Expanded Content: Platform Integrity & Scope Pulse */}
              <div className="j-sidebar-pulse-block">
                <h4>Engine Status</h4>
                <div className="j-pulse-grid">
                  <div className="j-pulse-item">
                    <FaDatabase className="j-pulse-icon" />
                    <div>
                      <span className="j-pulse-value">Live</span>
                      <span className="j-pulse-label">Data Stream</span>
                    </div>
                  </div>
                  <div className="j-pulse-item">
                    <FaShieldAlt className="j-pulse-icon" />
                    <div>
                      <span className="j-pulse-value">Verified</span>
                      <span className="j-pulse-label">Aggregators</span>
                    </div>
                  </div>
                  <div className="j-pulse-item">
                    <FaClock className="j-pulse-icon" />
                    <div>
                      <span className="j-pulse-value">&lt; 24h</span>
                      <span className="j-pulse-label">Index Age</span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}

        {(showSearchForm || jobData) && (
          <>
            {mode === "new" && (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  executeJobMarketAnalysis();
                }}
                className="j-job-search-dock-card"
              >
                <div className="j-search-flex-row">
                  <div className="j-input-icon-lockup">
                    <FaSearch className="j-input-prefix-icon" />
                    <input
                      value={targetRole}
                      onChange={(event) => setTargetRole(event.target.value)}
                      placeholder="Enter a target role, e.g. Senior Frontend Engineer"
                      className="j-search-input-field"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="j-job-btn j-job-btn-primary j-height-override"
                  >
                    {isLoading && <FaSpinner className="j-spin-engine" />}
                    <span>{isLoading ? "Analyzing..." : "Analyze Market"}</span>
                  </button>
                </div>
              </form>
            )}

            {!jobData ? (
              <EmptyView
                title="No analysis yet"
                message="Enter a target role above to generate market insights."
              />
            ) : (
              /* 2. DYNAMIC INTEL STREAM DATA VISUALIZATION */
              <div className="j-dashboard-content-stream">
                <section className="j-job-analytics-strip-hero">
                  <div className="j-radial-score-container">
                    <div className="j-score-inner-core">
                      <span className="j-score-integer">{alignmentQuotient}</span>
                      <span className="j-score-percentage-symbol">%</span>
                    </div>
                  </div>

                  <div className="j-hero-identity-block">
                    <h3>Market Fit Index</h3>
                    <p>
                      Your alignment score compared with hiring expectations for
                      this role.
                    </p>

                    <div className="j-system-metadata-pillbox">
                      <div className="j-meta-pill-indicator">
                        <FaChartLine />
                        <span>{analysis?.demandLevel || "Unspecified"} Demand</span>
                      </div>
                    </div>
                  </div>
                </section>

                <div className="j-job-bento-quad-grid">
                  <IntelTextPanel
                    icon={<FaChartLine />}
                    title="Market Summary"
                    text={analysis?.marketSummary}
                  />

                  <IntelTextPanel
                    icon={<FaRupeeSign />}
                    title="Compensation Insights"
                    text={analysis?.salaryInsights}
                  />

                  <IntelTextPanel
                    icon={<FaRocket />}
                    title="Role Outlook"
                    text={analysis?.futureOutlook}
                  />

                  <section className="j-job-bento-panel">
                    <div className="j-bento-panel-header">
                      <div className="j-header-left-meta">
                        <div className="j-bento-icon-frame">
                          <FaLightbulb />
                        </div>
                        <h4>Skill Gaps</h4>
                      </div>
                    </div>

                    <div className="j-bento-panel-content">
                      {Array.isArray(analysis?.skillGapForMarket) &&
                      analysis.skillGapForMarket.length > 0 ? (
                        <div className="j-bento-tag-matrix">
                          {analysis.skillGapForMarket.map((item, index) => (
                            <span
                              key={`gap-node-${index}`}
                              className="j-matrix-node-pill"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="j-empty-state-muted-text">
                          No major gaps were found for this role.
                        </p>
                      )}
                    </div>
                  </section>
                </div>

                <section className="j-job-workspace-block-card">
                  <div className="j-block-component-header">
                    <div className="j-header-icon-shell">
                      <FaBriefcase />
                    </div>

                    <div className="j-header-text-alignment-wrapper">
                      <h3>Matching Opportunities</h3>
                      <span className="j-sub-count-text">
                        {activeJobsList.length} openings evaluated
                      </span>
                    </div>
                  </div>

                  {activeJobsList.length > 0 ? (
                    <div className="j-job-opportunities-flex-grid">
                      {activeJobsList.map((job, index) => (
                        <article
                          key={job._id || `job-card-${index}`}
                          className="j-opportunity-listing-card"
                        >
                          <div className="j-opportunity-meta-top">
                            <h4>{job.title || "Untitled role"}</h4>
                            <p className="j-opportunity-organization">
                              {job.company || "Company not listed"}
                            </p>
                          </div>

                          {job.applyLink && (
                            <a
                              href={job.applyLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="j-job-btn j-job-btn-outline j-size-sm"
                            >
                              <span>Apply</span>
                            </a>
                          )}
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="j-nested-empty-card-block">
                      <p className="j-empty-state-muted-text">
                        No matching openings were found for this analysis.
                      </p>
                    </div>
                  )}
                </section>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function IntelTextPanel({ title, icon, text }) {
  return (
    <section className="j-job-bento-panel">
      <div className="j-bento-panel-header">
        <div className="j-header-left-meta">
          <div className="j-bento-icon-frame">{icon}</div>
          <h4>{title}</h4>
        </div>
      </div>

      <div className="j-bento-panel-content">
        <p className="j-bento-narrative-paragraph">
          {text || "No data available for this section."}
        </p>
      </div>
    </section>
  );
}