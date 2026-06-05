import { useState, useEffect } from "react";
import axios from "axios";
import "./index.css";

export default function GapAnalysis() {
  const [result, setResult] = useState(null);
  const [roadmapData, setRoadmapData] = useState(null); // Local state to append structural data
  const [hasCachedRoadmap, setHasCachedRoadmap] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [roadmapError, setRoadmapError] = useState("");

  // Sync workspace state on initial load or fresh window refreshes
  useEffect(() => {
    const fetchExistingWorkspace = async () => {
      try {
        const response = await axios.get(
          "http://localhost:7777/api/latest-analysis",
          { withCredentials: true }
        );
        
        if (response.data.data) {
          setResult(response.data.data);
          
          if (response.data.hasRoadmap) {
            setHasCachedRoadmap(true);
          }
        }
      } catch (error) {
        console.error("Could not fetch persistent workspace data:", error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchExistingWorkspace();
  }, []);

const handleAnalyze = async () => {
  try {
    setLoading(true);
    setRoadmapError(""); 

    const response = await axios.get(
      "http://localhost:7777/api/analyze-skills",
      { withCredentials: true }
    );

    setResult(response.data.data);

    // Invalidate current roadmap because profile changed
    setRoadmapData(null);
    setHasCachedRoadmap(false);

  } catch (error) {
    console.error("Analysis failed:", error);

    const errorMessage =
      error.response?.data?.message ||
      "Failed to analyze skills profile.";

    alert(errorMessage);
  } finally {
    setLoading(false);
  }
};

  const handleGenerateOrViewRoadmap = async () => {
    try {
      setLoadingRoadmap(true);
      setRoadmapError("");

      const response = await axios.get(
        "http://localhost:7777/api/roadmap",
        { withCredentials: true }
      );

      setRoadmapData(response.data.data);
      setHasCachedRoadmap(true);

    } catch (error) {
      setRoadmapError(
        error.response?.data?.message ||
        "Roadmap generation failed."
      );
    } finally {
      setLoadingRoadmap(false);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="gap-analysis-container placeholder-loading">
        <div className="analysis-card" style={{ textAlign: "center", padding: "60px" }}>
          <span className="spinner" style={{ borderTopColor: "var(--primary)" }}></span>
          <p style={{ marginTop: "15px", color: "var(--text-muted)", fontWeight: 500 }}>Syncing workspace state...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gap-analysis-container">
      <div className="analysis-card">
        
        {/* --- UPPER DASHBOARD CONFIG: Gaps & Profile Status --- */}
        <header className="analysis-header">
          <h1>AI Skill Gap Analysis</h1>
          <p>Instantly evaluate your technical capabilities against current industry requirements.</p>
          <button className="primary-btn" onClick={handleAnalyze} disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span> Analyzing Profile...
              </>
            ) : result ? (
              "🔄 Re-analyze Profile"
            ) : (
              "Analyze My Profile"
            )}
          </button>
        </header>

        {result && (
          <div className="analysis-results-wrapper">
            <div className="metrics-grid">
              <div className="metric-card score-card">
                <h3>Match Percentage</h3>
                <div className="progress-circle-fallback">
                  <span className="match-number">{result.matchPercentage}%</span>
                </div>
              </div>

              <div className="metric-card strengths-card">
                <h3>Core Strengths</h3>
                <div className="badge-wall">
                  {result.strengths && result.strengths.length > 0 ? (
                    result.strengths.map((skill) => (
                      <span key={skill} className="badge badge-success">{skill}</span>
                    ))
                  ) : (
                    <span className="no-data-text">No data processed yet</span>
                  )}
                </div>
              </div>

              <div className="metric-card gaps-card">
                <h3>Identified Gaps</h3>
                <div className="badge-wall">
                  {result.missingSkills && result.missingSkills.length > 0 ? (
                    result.missingSkills.map((skill) => (
                      <span key={skill} className="badge badge-danger">{skill}</span>
                    ))
                  ) : (
                    <span className="no-data-text">No gaps identified! Excellent work.</span>
                  )}
                </div>
              </div>
            </div>

            <div className="roadmap-action-section">
              <div className="divider"></div>
              <h3>Ready to bridge your skill deficits?</h3>
              <p>
                {hasCachedRoadmap 
                  ? "Your tailored roadmap blueprint is cached and ready to view instantly below." 
                  : "Generate a customized, sequence-driven roadmap compiled specifically for your gaps."}
              </p>
              <button 
                className={hasCachedRoadmap ? "success-action-btn" : "secondary-btn"} 
                onClick={handleGenerateOrViewRoadmap} 
                disabled={loadingRoadmap}
              >
                {loadingRoadmap ? (
                  <>
                    <span className="spinner"></span> Assembling Core Framework...
                  </>
                ) : hasCachedRoadmap && roadmapData ? (
                  "✨ Roadmap Active Below"
                ) : hasCachedRoadmap ? (
                  "📂 Load Saved Roadmap (Instant)"
                ) : (
                  "Generate Detailed Roadmap"
                )}
              </button>
              {roadmapError && (
                <div className="error-banner">
                  {roadmapError}
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- LOWER SEGMENT: Embedded Roadmap View Layout --- */}
        {roadmapData && (
          <div className="detailed-roadmap-wrapper" style={{ borderTop: "1px dashed var(--border-color)", paddingTop: "3rem" }}>
            
            {/* Strategy Notice Banner */}
            <div className="roadmap-insight-banner">
              <div className="insight-icon">🔄</div>
              <div className="insight-body">
                <h4>Keep Your Strategy Calibrated</h4>
                <p>
                  Your career roadmap shouldn't be static. As you master new skills, complete milestone projects, or as market expectations shift, your training track must adjust. 
                  <strong> Re-analyzing your profile regularly</strong> prevents redundant learning, integrates your real-time breakthroughs, and optimizes your velocity toward landing a high-impact role.
                </p>
              </div>
            </div>

            {/* Target Role Banner Header */}
            <div className="roadmap-header-banner">
              <div className="banner-left">
                <span className="banner-subtitle">Target Career Objective</span>
                <h2>{roadmapData.targetRole || "MERN Stack Developer"}</h2>
              </div>
              <div className="duration-tag">
                <span className="icon">⏱️</span>
                <div>
                  <span className="tag-label">Estimated Track</span>
                  <strong>{roadmapData.totalEstimatedDuration || "Variable PACE"}</strong>
                </div>
              </div>
            </div>

            {/* Sequential Phase Timeline Wrapper */}
            <div className="timeline-container">
              {roadmapData.roadmap?.map((phase, pIdx) => (
                <div key={pIdx} className="timeline-phase-card">
                  <div className="phase-marker">
                    <span>{pIdx + 1}</span>
                  </div>
                  
                  <div className="phase-content">
                    <div className="phase-header">
                      <h3>{phase.phase}</h3>
                      <span className="phase-duration">{phase.duration || "Flexible Pace"}</span>
                    </div>
                    
                    <div className="objective-block">
                      <span className="section-label">Phase Objective</span>
                      <p>{phase.objective}</p>
                    </div>
                    
                    <div className="phase-grid">
                      {/* Left Column: Tech Stack & Topics */}
                      <div className="grid-col tech-column">
                        <h4>Target Technologies & Focus</h4>
                        <div className="badge-wall">
                          {phase.skills?.map((s, idx) => (
                            <span key={idx} className="badge badge-neutral">{s}</span>
                          ))}
                        </div>
                        <ul className="topics-list">
                          {phase.topics?.map((t, idx) => (
                            <li key={idx}>
                              <span className="bullet-dot">•</span>
                              <span className="topic-text">{t}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Right Column: Build Milestones */}
                      <div className="grid-col project-column">
                        <h4>Practical Applications & Projects</h4>
                        <div className="projects-list-wrapper">
                          {phase.projects?.map((proj, idx) => (
                            <div key={idx} className="project-subcard">
                              <div className="proj-sub-header">
                                <h5>{proj.title}</h5>
                                <span className={`difficulty-tag ${proj.difficulty?.toLowerCase()}`}>
                                  {proj.difficulty}
                                </span>
                              </div>
                              <p>{proj.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Base Recommended Resources Bar */}
                    {(phase.resources?.courses?.length > 0 || phase.resources?.documentation?.length > 0) && (
                      <div className="resources-section">
                        <h4>Curated Learning Assets</h4>
                        <div className="resources-links">
                          {phase.resources?.courses?.length > 0 && (
                            <div className="resource-item">
                              <span className="res-icon">📚</span>
                              <p><strong>Courses:</strong> {phase.resources.courses.join(", ")}</p>
                            </div>
                          )}
                          {phase.resources?.documentation?.length > 0 && (
                            <div className="resource-item">
                              <span className="res-icon">📄</span>
                              <p><strong>Docs & Reference:</strong> {phase.resources.documentation.join(", ")}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Production Capstone Module */}
            {roadmapData.capstoneProject && (
              <div className="capstone-card">
                <div className="capstone-badge">PRODUCTION ENTERPRISE PROJECT</div>
                <div className="capstone-header">
                  <span className="trophy">🏆</span>
                  <h3>Capstone Architecture: {roadmapData.capstoneProject.title}</h3>
                </div>
                <p>{roadmapData.capstoneProject.description}</p>
                <div className="capstone-tech">
                  <strong>Integration Tech Stack:</strong>
                  <div className="mini-tag-group">
                    {roadmapData.capstoneProject.skillsCovered?.map((s, i) => (
                      <span key={i} className="mini-tag">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Career Checkpoints Blocks */}
            {roadmapData.jobPreparation && (
              <div className="job-prep-grid">
                <div className="prep-card">
                  <h4>📄 Resume Engineering Checklist</h4>
                  <ul className="prep-list checkmark-style">
                    {roadmapData.jobPreparation.resumeChecklist?.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="prep-card">
                  <h4>💡 Technical Interview Drill Points</h4>
                  <ul className="prep-list flash-style">
                    {roadmapData.jobPreparation.interviewTopics?.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}