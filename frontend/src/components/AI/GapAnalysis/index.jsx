import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import {
  FaCheckCircle,
  FaCode,
  FaExclamationTriangle,
  FaFlagCheckered,
  FaGraduationCap,
  FaRedo,
  FaRocket,
  FaArrowLeft,
  FaSpinner
} from "react-icons/fa";
import { LoaderView, ErrorView, EmptyView } from "../../Common";
import "./index.css";

const API_BASE_URL = import.meta.env?.VITE_API_URL || "http://localhost:7777";

export default function GapAnalysis() {
  const [roadmap, setRoadmap] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [errorContext, setErrorContext] = useState(null);
  const [notification, setNotification] = useState("");
  const [isWorkspaceActive, setIsWorkspaceActive] = useState(false);

  const synchronizeWorkspaceMetrics = async () => {
    try {
      setIsSyncing(true);
      setNotification("");

      const response = await axios.get(`${API_BASE_URL}/api/gap-analysis`, {
        withCredentials: true
      });

      const payload = response.data?.data || response.data?.roadmap || response.data;
      setRoadmap(payload);
      setIsWorkspaceActive(true);
    } catch (err) {
      setNotification(
        err.response?.data?.message || "Unable to sync your skill gap analysis."
      );
    } finally {
      setIsSyncing(false);
    }
  };

  const initializeWorkspaceTelemetry = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorContext(null);

      const response = await axios.get(`${API_BASE_URL}/api/gap-analysis/latest`, {
        withCredentials: true
      });

      if (response.data) {
        await synchronizeWorkspaceMetrics();
      }
    } catch (err) {
      if (err.response?.status !== 404) {
        setErrorContext({
          message:
            err.response?.data?.message ||
            "Unable to initialize skill gap analysis.",
          status: err.response?.status
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeWorkspaceTelemetry();
  }, [initializeWorkspaceTelemetry]);

  useEffect(() => {
    if (!notification) return;

    const timer = setTimeout(() => setNotification(""), 4000);
    return () => clearTimeout(timer);
  }, [notification]);

  if (isLoading) {
    return <LoaderView message="Loading skill gap analysis..." />;
  }

  if (errorContext) {
    return (
      <ErrorView
        message={errorContext.message}
        statusCode={errorContext.status}
        onRetry={initializeWorkspaceTelemetry}
      />
    );
  }

  return (
    <main className="ga-viewport-workspace">
      <div className="ga-grid-shell">
        {notification && (
          <div className="ga-toast-notification" role="alert" aria-live="assertive">
            <span>{notification}</span>
          </div>
        )}

        {!isWorkspaceActive && (
          <section className="ga-hero-onboarding-panel">
            <div className="ga-onboarding-text-lockup">
              <span className="ga-badge-accent">Skill analysis</span>
              <h1>Skill Gap Analysis</h1>
              <p>
                Review your current strengths, missing skills, learning milestones,
                project recommendations, and interview preparation plan.
              </p>
            </div>

            <div className="ga-onboarding-actions-lockup">
              <button
                type="button"
                className="ga-btn ga-btn-primary"
                onClick={synchronizeWorkspaceMetrics}
                disabled={isSyncing}
              >
                {isSyncing ? <FaSpinner className="ga-spin-engine" /> : <FaRedo />}
                <span>{isSyncing ? "Syncing..." : "Open Analysis"}</span>
              </button>
            </div>
          </section>
        )}

        {isWorkspaceActive && !roadmap && (
          <EmptyView
            title="No analysis available"
            message="Run a resume analysis first to generate your skill gap roadmap."
          />
        )}

        {isWorkspaceActive && roadmap && (
          <>
            <header className="ga-control-bar">
              <div className="ga-bar-interactive-left">
                <button
                  type="button"
                  className="ga-action-icon-btn"
                  onClick={() => setIsWorkspaceActive(false)}
                  aria-label="Go back"
                >
                  <FaArrowLeft />
                </button>

                <div className="ga-bar-title-hierarchy">
                  <h2>Skill Gap Analysis</h2>
                  {roadmap.lastAnalyzed && (
                    <span className="ga-timestamp-echo">
                      Last analyzed: {roadmap.lastAnalyzed}
                    </span>
                  )}
                </div>
              </div>
            </header>

            <section className="ga-analytics-strip-hero">
              <div className="ga-radial-score-container">
                <div className="ga-score-inner-core">
                  <span className="ga-score-integer">
                    {roadmap.matchPercentage ?? "--"}
                  </span>
                  <span className="ga-score-percentage-symbol">%</span>
                </div>
              </div>

              <div className="ga-hero-identity-block">
                <h3>{roadmap.targetRole || "Target role not specified"}</h3>
                <p>
                  Your current profile alignment based on skills, experience,
                  learning needs, and target-role expectations.
                </p>

                <div className="ga-system-metadata-pillbox">
                  <div className="ga-meta-pill">
                    Duration: {roadmap.totalEstimatedDuration || "Variable"}
                  </div>
                  <div className="ga-meta-pill">
                    {roadmap.milestones?.length || 0} milestones
                  </div>
                </div>
              </div>
            </section>

            <div className="ga-bento-split-row">
              <VectorTagsPanel
                title="Validated Strengths"
                subtext="Skills already visible in your profile"
                icon={<FaCheckCircle />}
                items={roadmap.strengths}
              />

              <VectorTagsPanel
                title="Priority Skill Gaps"
                subtext="Areas to improve for your target role"
                icon={<FaExclamationTriangle />}
                items={roadmap.missingSkills}
              />
            </div>

            <section className="ga-workspace-block-card">
              <BlockSectionHeader icon={<FaRocket />} title="Learning Roadmap" />

              <div className="ga-timeline-wrapper">
                {Array.isArray(roadmap.milestones) &&
                  roadmap.milestones.map((milestone, index) => (
                    <ChronologyMilestoneCard
                      key={milestone._id || `phase-node-${index}`}
                      milestone={milestone}
                      index={index}
                    />
                  ))}
              </div>
            </section>

            <section className="ga-workspace-block-card ga-capstone-accent-layer">
              <BlockSectionHeader
                icon={<FaFlagCheckered />}
                title="Capstone Project"
              />

              <div className="ga-capstone-specification-layout">
                <h4>
                  {roadmap.capstoneProject?.title ||
                    "Capstone project not available"}
                </h4>
                <p>
                  {roadmap.capstoneProject?.description ||
                    "Complete your analysis to receive a practical validation project."}
                </p>

                {Array.isArray(roadmap.capstoneProject?.skillsCovered) && (
                  <div className="ga-inline-capsule-group">
                    {roadmap.capstoneProject.skillsCovered.map((skill, index) => (
                      <span key={`cap-skill-${index}`} className="ga-capsule-badge">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <div className="ga-bento-split-row">
              <TextCheckedListPanel
                title="Resume Improvements"
                icon={<FaGraduationCap />}
                items={roadmap.jobPreparation?.resumeChecklist}
              />

              <TextCheckedListPanel
                title="Interview Focus Areas"
                icon={<FaCode />}
                items={roadmap.jobPreparation?.interviewTopics}
              />
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function BlockSectionHeader({ icon, title }) {
  return (
    <div className="ga-block-component-header">
      <div className="ga-header-icon-shell">{icon}</div>
      <h3>{title}</h3>
    </div>
  );
}

function VectorTagsPanel({ title, subtext, icon, items = [] }) {
  const collection = useMemo(() => (Array.isArray(items) ? items : []), [items]);

  return (
    <section className="ga-bento-panel">
      <div className="ga-bento-panel-header">
        <div className="ga-header-left-meta">
          <div className="ga-bento-icon-frame">{icon}</div>

          <div className="ga-bento-title-block">
            <h4>{title}</h4>
            <span className="ga-bento-subtext">{subtext}</span>
          </div>
        </div>

        <div className="ga-bento-count-badge">{collection.length}</div>
      </div>

      <div className="ga-bento-panel-content">
        {collection.length > 0 ? (
          <div className="ga-bento-tag-matrix">
            {collection.map((item, index) => (
              <span key={`${item}-${index}`} className="ga-matrix-node-pill">
                {item}
              </span>
            ))}
          </div>
        ) : (
          <p className="ga-empty-state-muted-text">
            No items available for this section.
          </p>
        )}
      </div>
    </section>
  );
}

function ChronologyMilestoneCard({ milestone, index }) {
  return (
    <article className="ga-timeline-node-card">
      <div className="ga-node-card-structural-spine" />

      <div className="ga-node-card-header-row">
        <div className="ga-header-identity-group">
          <span className="ga-node-index-tag">Phase {index + 1}</span>
          <h4>{milestone.phase || "Untitled milestone"}</h4>
        </div>

        <span className="ga-node-duration-ticker">
          {milestone.duration || "Flexible"}
        </span>
      </div>

      <p className="ga-node-objective-statement">
        {milestone.objective || "No objective provided for this milestone."}
      </p>

      <div className="ga-node-sub-bento-grid">
        <TimelineSubSection title="Core Skills" items={milestone.skills} />
        <TimelineSubSection title="Key Topics" items={milestone.topics} />
      </div>

      {Array.isArray(milestone.projects) && milestone.projects.length > 0 && (
        <div className="ga-node-internal-projects-vault">
          <h5>Practice Projects</h5>

          <div className="ga-internal-projects-stack">
            {milestone.projects.map((project, projectIndex) => (
              <div
                key={project._id || `project-${projectIndex}`}
                className="ga-sandbox-project-card"
              >
                <div className="ga-sandbox-card-header">
                  <h6>{project.title}</h6>
                  <span className="ga-complexity-metric-badge">
                    {project.difficulty || "Standard"}
                  </span>
                </div>

                <p>{project.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="ga-node-sub-bento-grid ga-utility-divider-top">
        <TimelineSubSection
          title="Recommended Courses"
          items={milestone.resources?.courses}
        />
        <TimelineSubSection
          title="Documentation"
          items={milestone.resources?.documentation}
        />
      </div>
    </article>
  );
}

function TimelineSubSection({ title, items = [] }) {
  const dataset = useMemo(() => (Array.isArray(items) ? items : []), [items]);

  return (
    <div className="ga-timeline-sub-section-block">
      <h5>{title}</h5>

      {dataset.length > 0 ? (
        <div className="ga-sub-section-pill-cloud">
          {dataset.map((item, index) => (
            <span key={`${title}-${index}`} className="ga-cloud-pill-item">
              {item}
            </span>
          ))}
        </div>
      ) : (
        <span className="ga-empty-sub-text">None listed</span>
      )}
    </div>
  );
}

function TextCheckedListPanel({ title, icon, items = [] }) {
  const collection = useMemo(() => (Array.isArray(items) ? items : []), [items]);

  return (
    <section className="ga-bento-panel">
      <div className="ga-bento-panel-header ga-margin-bottom-sm">
        <div className="ga-header-left-meta">
          <div className="ga-bento-icon-frame">{icon}</div>
          <h4>{title}</h4>
        </div>
      </div>

      <div className="ga-bento-panel-content">
        {collection.length > 0 ? (
          <ul className="ga-data-checklist">
            {collection.map((item, index) => (
              <li key={`${title}-${index}`}>
                <span className="ga-checklist-indicator-dot" />
                <p>{item}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="ga-empty-state-muted-text">
            No recommendations available.
          </p>
        )}
      </div>
    </section>
  );
}