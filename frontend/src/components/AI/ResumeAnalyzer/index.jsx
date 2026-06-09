import { useState, useEffect } from "react";
import roles from "../../../data/roles";
import "./index.css";

const ResumeAnalyzer = () => {
  const [targetRole, setTargetRole] = useState("");
  const [resume, setResume] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("form");
  const [initialLoading, setInitialLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const availableRoles = Object.keys(roles || {});

  const fetchLatestAnalysis = async () => {
    try {
      setInitialLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:7777/api/resume-analysis/latest",
        { credentials: "include" }
      );

      const data = await response.json();
      
      if (response.status === 404) {
        setResult(null);
        setViewMode("form");
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to load analysis");
      }

      if (data.success && data.data) {
        setResult(data.data);
        setTargetRole(data.data.targetRole || "");
        setViewMode("results");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestAnalysis();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!resume || !targetRole) {
      setError("Please select a role and upload a resume");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const formData = new FormData();
      formData.append("targetRole", targetRole);
      formData.append("resume", resume);

      const response = await fetch(
        "http://localhost:7777/api/resume-analysis",
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Resume analysis failed");
      }

      const analysisData = data.data || data;
      setResult(analysisData);
      setTargetRole(analysisData.targetRole || targetRole);
      setViewMode("results");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewAnalysis = () => {
    setViewMode("form");
    setResult(null);
    setResume(null);
    setError("");
  };

  const analysis = result?.analysis ?? {};
  const aiAnalysis = result?.aiAnalysis ?? null;

  if (initialLoading) {
    return (
      <div className="resume-analyzer-container">
        <div className="resume-card loading-card">
          <div className="loading-spinner"></div>
          <p>Loading saved analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="resume-analyzer-container">
      <div className="resume-card">
        <header className="analyzer-header">
          <h1 className="page-title">Resume Analyzer</h1>
          {viewMode === "form" && (
            <button onClick={fetchLatestAnalysis} className="secondary-btn">
              📂 Load Saved Analysis
            </button>
          )}
        </header>

        {error && <div className="error-box">{error}</div>}

        {viewMode === "form" ? (
          <form onSubmit={handleSubmit} className="analyzer-form">
            <div className="form-group">
              <label htmlFor="target-role-select">Target Role</label>
              <select
                id="target-role-select"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              >
                <option value="">Select Role</option>
                {availableRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="resume-file-input">Upload Resume</label>
              <input
                id="resume-file-input"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setResume(e.target.files[0] || null)}
              />
            </div>

            <button type="submit" disabled={submitting} className="primary-btn submit-btn">
              {submitting ? "Analyzing..." : "Analyze Resume"}
            </button>
          </form>
        ) : (
          <div className="results-wrapper">
            <div className="results-actions">
              <h2>
                Analysis For: <span className="highlight-text">{targetRole}</span>
              </h2>
              <button onClick={handleNewAnalysis} className="primary-btn">
                🔄 New Analysis
              </button>
            </div>

            {/* Dashboard Hero Metrics Row */}
            <div className="metrics-summary-row">
              <div className="metric-card score-match">
                <span>Match Percentage</span>
                <h3>{analysis.matchPercentage ?? 0}%</h3>

                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${analysis.matchPercentage ?? 0}%` }}
                  />
                </div>
              </div>
              {aiAnalysis && (
                <>
                  <div className="metric-card level-ai">
                    <span>Candidate Level</span>
                    <h3>{aiAnalysis.candidateLevel}</h3>
                  </div>

                  <div className="metric-card interview-ai">
                    <span>Interview Readiness</span>
                    <h3>{aiAnalysis?.interviewReadiness || "Pending"}</h3>
                  </div>
                </>
              )}
            </div>

            {/* Main Balanced Content Split Grid */}
            <div className="results-grid">
              
              {/* Left Column: Candidate Base Profile */}
              <div className="grid-column">
                <div className="result-block">
                  <h3>📝 Executive Summary</h3>
                  <p className="block-text">{aiAnalysis?.summary || result.resumeData?.summary || "No summary available"}</p>
                </div>

                <div className="result-block">
                  <h3>📄 Extracted Skills</h3>
                  <div className="tags-container">
                    {result?.extractedSkills?.length > 0 ? (
                      result.extractedSkills.map((skill) => (
                        <span key={skill} className="skill-tag">{skill}</span>
                      ))
                    ) : (
                      <p className="empty-text">No skills detected</p>
                    )}
                  </div>
                </div>

                <div className="result-block">
                  <h3>⚠️ Missing Skills</h3>
                  <div className="tags-container">
                    {(aiAnalysis?.missingSkills || analysis?.missingSkills)?.length > 0 ? (
                      (aiAnalysis?.missingSkills || analysis?.missingSkills).map((item) => (
                        <span key={item} className="skill-tag missing">{item}</span>
                      ))
                    ) : (
                      <p className="empty-text">No skill gaps discovered</p>
                    )}
                  </div>
                </div>

                <div className="result-block">
                  <h3>🎓 Education</h3>

                  {result?.resumeData?.education?.length > 0 ? (
                    result.resumeData.education.map((edu, index) => (
                      <div key={index} className="detail-item">
                        <strong>{edu.degree}</strong>
                        <p>
                          {edu.institution} • {edu.graduation_year}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="empty-text">No education information found</p>
                  )}
                </div>

                <div className="result-block">
                  <h3>🚀 Project Inventory</h3>

                  {result?.resumeData?.projects?.length > 0 ? (
                    result.resumeData.projects.map((project, index) => (
                      <div key={index} className="project-card">
                        <h4>{project.name}</h4>

                        <div className="tags-container mini-tags">
                          {project.technologies?.map((tech) => (
                            <span key={tech} className="skill-tag">
                              {tech}
                            </span>
                          ))}
                        </div>

                        <ul className="project-bullets">
                          {project.description?.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ))
                  ) : (
                    <p className="empty-text">No projects detected</p>
                  )}
                </div>
              </div>

              {/* Right Column: AI Strategic Feedback & Growth Path */}
              <div className="grid-column">
                {aiAnalysis && (
                  <div className="ai-analysis-section">
                    <div className="result-block insight-block">
                      <h3>💪 Core Strengths Evaluation</h3>
                          {aiAnalysis.strengths?.length > 0 ? (
                            aiAnalysis.strengths.map((item, index) => (
                              <div key={index} className="feedback-item success-item">
                                ✅ {item}
                              </div>
                            ))
                          ) : (
                            <p className="empty-text">No strengths identified</p>
                          )}
                    </div>

                    <div className="result-block insight-block">
                      <h3>❌ Development Areas & Weaknesses</h3>

                      {aiAnalysis.weaknesses?.length > 0 ? (
                        aiAnalysis.weaknesses.map((item, index) => (
                          <div key={index} className="feedback-item error-item">
                            ❌ {item}
                          </div>
                        ))
                      ) : (
                        <p className="empty-text">No weaknesses identified</p>
                      )}
                    </div>

                    <div className="result-block">
                      <h3>✍️ Direct Resume Refinements</h3>

                      {aiAnalysis.resumeFeedback?.length > 0 ? (
                        <ul className="feedback-bullets">
                          {aiAnalysis.resumeFeedback.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="empty-text">No resume suggestions available</p>
                      )}
                    </div>

                    <div className="result-block">
                      <h3>🎯 Strategic Career Recommendations</h3>
                      {aiAnalysis.careerRecommendations?.length > 0 ? (
                        aiAnalysis.careerRecommendations.map((item, index) => (
                          <div key={index} className="feedback-item recommendation-item">
                            🚀 {item}
                          </div>
                        ))
                      ) : (
                        <p className="empty-text">No recommendations available</p>
                      )}
                    </div>

                    <div className="result-block">
                      <h3>🎤 Interview Readiness Appraisal</h3>
                      <p className="block-text">{aiAnalysis.interviewReadiness}</p>
                    </div>

                  </div>
                )}
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeAnalyzer;