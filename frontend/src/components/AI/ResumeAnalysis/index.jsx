import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaCloudUploadAlt,
  FaFileAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaLightbulb,
  FaProjectDiagram,
  FaGraduationCap,
  FaRedo,
  FaSpinner,
  FaClipboardCheck,
  FaArrowLeft
} from "react-icons/fa";
import { LoaderView, ErrorView, EmptyView } from "../../Common";
import "./index.css";

const API_BASE_URL = import.meta.env?.VITE_API_URL || "http://localhost:7777";

export default function ResumeAnalyzer() {
  const navigate = useNavigate();

  const [latest, setLatest] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [notification, setNotification] = useState("");
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [mode, setMode] = useState(null);

  const showToast = (message) => {
    setNotification(message);
  };

  const getLatestAnalysis = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const response = await axios.get(
        `${API_BASE_URL}/api/resume-analysis/latest`,
        { withCredentials: true }
      );

      setLatest(response.data?.data || null);
    } catch (err) {
      if (err.response?.status === 404) {
        setLatest(null);
      } else {
        setErrorMsg(
          err.response?.data?.message || "Could not load the latest resume analysis."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectReload = async () => {
    setMode("analysis");
    setShowWorkspace(true);
    await getLatestAnalysis();
  };

  const handleSelectUploadOnly = () => {
    setLatest(null);
    setMode("upload");
    setShowWorkspace(true);
  };

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!resumeFile) {
      showToast("Please select a resume file first.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resumeFile);

    try {
      setUploading(true);
      setNotification("");

      const response = await axios.post(
        `${API_BASE_URL}/api/resume-analysis`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" }
        }
      );

      await getLatestAnalysis();
      showToast(response.data?.message || "Resume analyzed successfully.");
      setResumeFile(null);
      setMode("analysis");
    } catch (err) {
      showToast(
        err.response?.data?.message || "Resume analysis failed. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleBack = () => {
    if (showWorkspace) {
      setShowWorkspace(false);
      setMode(null);
      setLatest(null);
      setResumeFile(null);
      return;
    }

    navigate("/dashboard");
  };

  useEffect(() => {
    if (!notification) return;

    const timer = setTimeout(() => setNotification(""), 4000);
    return () => clearTimeout(timer);
  }, [notification]);

  if (loading) {
    return <LoaderView message="Loading resume analysis..." />;
  }

  if (errorMsg) {
    return <ErrorView message={errorMsg} onRetry={getLatestAnalysis} />;
  }

  const ai = latest?.aiAnalysis || {};
  const resume = latest?.resumeData || {};
  const score = Number(ai?.overallScore || 0);
  const skills = latest?.extractedSkills || resume?.skills || [];
  const projects = resume?.projects || [];

  return (
    <main className="ra-intel-workspace">
      <div className="ra-grid-shell">
        {notification && (
          <div className="ra-toast-notification" role="alert" aria-live="polite">
            <span>{notification}</span>
          </div>
        )}

        <header className="ra-control-bar">
          <div className="ra-bar-interactive-left">
            <button
              type="button"
              className="ra-action-icon-btn"
              onClick={handleBack}
              aria-label="Go back"
            >
              <FaArrowLeft />
            </button>

            <div className="ra-bar-title-hierarchy">
              <h1>{showWorkspace ? "Resume Analysis" : "Resume Analyzer"}</h1>
              <p className="ra-timestamp-echo">
                {showWorkspace && mode === "analysis" && latest?.createdAt
                  ? `Analyzed ${new Date(latest.createdAt).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short"
                    })}`
                  : "Evaluate resume quality, strengths, gaps, projects, and readiness."}
              </p>
            </div>
          </div>

          {showWorkspace && (
            <div className="ra-workspace-right-group">
              <span className="ra-badge-accent">Workspace active</span>
            </div>
          )}
        </header>

        {!showWorkspace && (
          <section className="ra-hero-onboarding-panel">
            <div className="ra-onboarding-text-lockup">
              <span className="ra-badge-accent">Resume review</span>
              <h2>Improve your resume with focused analysis</h2>
              <p>
                Upload your resume or restore your latest analysis to review scoring,
                strengths, weaknesses, project quality, and practical improvements.
              </p>
            </div>

            <div className="ra-horizontal-actions">
              <button
                type="button"
                className="ra-btn ra-btn-secondary"
                onClick={handleSelectReload}
              >
                <FaRedo />
                <span>Restore Previous</span>
              </button>

              <button
                type="button"
                className="ra-btn ra-btn-primary"
                onClick={handleSelectUploadOnly}
              >
                <FaCloudUploadAlt />
                <span>Upload Resume</span>
              </button>
            </div>
          </section>
        )}

        {showWorkspace && (
          <div className="ra-dashboard-content-stream">
            {mode === "upload" && (
              <form onSubmit={handleUpload} className="ra-search-dock-card">
                <div className="ra-upload-flex-container">
                  <div className="ra-input-icon-lockup">
                    <label
                      className={`ra-upload-dropzone ${
                        resumeFile ? "ra-has-file-attached" : ""
                      }`}
                    >
                      <FaCloudUploadAlt className="ra-upload-prefix-icon" />

                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="ra-hidden-native-input"
                        onChange={(event) =>
                          setResumeFile(event.target.files?.[0] || null)
                        }
                      />

                      <span className="ra-dropzone-text">
                        {resumeFile ? resumeFile.name : "Select a resume file"}
                      </span>
                      <span className="ra-dropzone-sub-label">
                        PDF, DOC, or DOCX up to 5MB
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={uploading || !resumeFile}
                    className="ra-btn ra-btn-primary ra-upload-submit-btn"
                  >
                    {uploading && <FaSpinner className="ra-spin-engine" />}
                    <span>{uploading ? "Analyzing..." : "Analyze Resume"}</span>
                  </button>
                </div>
              </form>
            )}

            {mode === "analysis" && (
              <div className="ra-workspace-data-layers">
                {!latest ? (
                  <EmptyView
                    title="No analysis found"
                    message="Upload a resume to generate your first analysis."
                  />
                ) : (
                  <div className="ra-workspace-composite-stream">
                    <section className="ra-analytics-strip-hero">
                      <div className="ra-radial-score-container">
                        <div className="ra-score-inner-core">
                          <span className="ra-score-integer">{score || "--"}</span>
                          <span className="ra-score-percentage-symbol">%</span>
                        </div>
                      </div>

                      <div className="ra-hero-identity-block">
                        <h3>{ai?.candidateLevel || "Resume Evaluation"}</h3>
                        <p>
                          Overall resume score based on structure, clarity,
                          experience, project quality, and role readiness.
                        </p>

                        <div className="ra-system-metadata-pillbox">
                          <div className="ra-meta-pill-indicator">
                            <FaClipboardCheck />
                            <span>
                              Interview Readiness:{" "}
                              {ai?.interviewReadiness || "Not specified"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section className="ra-bento-panel ra-full-width-bento">
                      <div className="ra-bento-panel-header">
                        <div className="ra-header-left-meta">
                          <div className="ra-bento-icon-frame">
                            <FaFileAlt />
                          </div>
                          <h4>Summary</h4>
                        </div>
                      </div>

                      <div className="ra-bento-panel-content">
                        <p className="ra-bento-narrative-paragraph">
                          {ai?.summary ||
                            resume?.summary ||
                            "No summary was generated for this resume."}
                        </p>
                      </div>
                    </section>

                    <div className="ra-bento-quad-grid">
                      <IntelListPanel
                        icon={<FaCheckCircle />}
                        title="Strengths"
                        items={ai?.strengths}
                      />

                      <IntelListPanel
                        icon={<FaExclamationTriangle />}
                        title="Weaknesses"
                        items={ai?.weaknesses}
                      />

                      <IntelListPanel
                        icon={<FaLightbulb />}
                        title="Recommended Improvements"
                        items={ai?.resumeFeedback}
                      />

                      <IntelTextPanel
                        icon={<FaProjectDiagram />}
                        title="Project Evaluation"
                        text={ai?.projectEvaluation}
                      />
                    </div>

                    <div className="ra-bento-quad-grid">
                      <section className="ra-bento-panel">
                        <div className="ra-bento-panel-header">
                          <div className="ra-header-left-meta">
                            <div className="ra-bento-icon-frame">
                              <FaCheckCircle />
                            </div>
                            <h4>Extracted Skills</h4>
                          </div>
                        </div>

                        <div className="ra-bento-panel-content">
                          {skills.length ? (
                            <div className="ra-capsule-tag-matrix">
                              {skills.map((skill, index) => (
                                <span
                                  key={`skill-node-${index}`}
                                  className="ra-capsule-node"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="ra-empty-state-muted-text">
                              No skills were extracted from this resume.
                            </p>
                          )}
                        </div>
                      </section>

                      <IntelListPanel
                        icon={<FaGraduationCap />}
                        title="Education"
                        items={resume?.education}
                      />
                    </div>

                    <section className="ra-workspace-block-card">
                      <div className="ra-block-component-header">
                        <div className="ra-header-icon-shell">
                          <FaProjectDiagram />
                        </div>

                        <div className="ra-header-text-wrapper">
                          <h3>Projects</h3>
                          <span className="ra-sub-count-text">
                            {projects.length} project{projects.length === 1 ? "" : "s"} found
                          </span>
                        </div>
                      </div>

                      {projects.length ? (
                        <div className="ra-projects-grid">
                          {projects.map((project, index) => {
                            const projectText =
                              typeof project === "object"
                                ? `${project?.name || project?.title || "Project"}${
                                    project?.description
                                      ? ` - ${project.description}`
                                      : ""
                                  }${
                                    project?.technologies
                                      ? ` Stack: ${project.technologies}`
                                      : ""
                                  }`
                                : project;

                            return (
                              <article
                                key={`project-card-${index}`}
                                className="ra-project-card"
                              >
                                <p className="ra-bento-narrative-paragraph">
                                  {projectText}
                                </p>
                              </article>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="ra-nested-empty-card-block">
                          <p className="ra-empty-state-muted-text">
                            No structured projects were found in this resume.
                          </p>
                        </div>
                      )}
                    </section>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function IntelTextPanel({ title, icon, text }) {
  return (
    <section className="ra-bento-panel">
      <div className="ra-bento-panel-header">
        <div className="ra-header-left-meta">
          <div className="ra-bento-icon-frame">{icon}</div>
          <h4>{title}</h4>
        </div>
      </div>

      <div className="ra-bento-panel-content">
        <p className="ra-bento-narrative-paragraph">
          {text || "No evaluation was generated for this section."}
        </p>
      </div>
    </section>
  );
}

function IntelListPanel({ icon, title, items = [] }) {
  return (
    <section className="ra-bento-panel">
      <div className="ra-bento-panel-header">
        <div className="ra-header-left-meta">
          <div className="ra-bento-icon-frame">{icon}</div>
          <h4>{title}</h4>
        </div>
      </div>

      <div className="ra-bento-panel-content">
        {items?.length ? (
          <div className="ra-list-matrix">
            {items.map((item, index) => {
              const textValue =
                typeof item === "object"
                  ? `${item?.degree || item?.title || ""} ${
                      item?.school || item?.field || ""
                    }`.trim()
                  : item;

              return (
                <span key={`node-row-${index}`} className="ra-list-node">
                  {textValue}
                </span>
              );
            })}
          </div>
        ) : (
          <p className="ra-empty-state-muted-text">
            No items were found for this section.
          </p>
        )}
      </div>
    </section>
  );
}