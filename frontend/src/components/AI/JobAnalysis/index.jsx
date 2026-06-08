import { useState } from "react";
import "./index.css";

const JobAnalysis = () => {
  const [targetRole, setTargetRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [cached, setCached] = useState(false);

  // Fixed the broken regex to safely strip markdown bold '**' syntax
  const formatText = (text) => {
    if (!text) return "";
    return text.replace(/\*\*/g, "");
  };

  const handleAnalyze = async () => {
    if (!targetRole.trim()) return;

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:7777/api/job-analysis",
        {
          method: "POST",
          credentials: "include", // IMPORTANT
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            targetRole,
          }),
        }
      );

      const data = await response.json();

      console.log("Response:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch analysis"
        );
      }

      setAnalysis(data.analysis);
      setJobs(data.jobs || []);
      setCached(data.cached || false);
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!targetRole.trim()) return;

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:7777/api/job-analysis/refresh",
        {
          method: "POST",
          credentials: "include", // IMPORTANT
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            targetRole,
          }),
        }
      );

      const data = await response.json();

      console.log("Refresh Response:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to refresh"
        );
      }

      setAnalysis(data.analysis);
      setJobs(data.jobs || []);
      setCached(false);
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="job-analysis-page">
      <div className="job-analysis-header">
        <div>
          <h1 className="page-title">Job Market Analysis</h1>
          <p className="page-subtitle">
            Real-time market demand, salary trends, and hiring opportunities.
          </p>
        </div>
        <div className="search-container">
          <input
            type="text"
            className="role-input"
            placeholder="AI Engineer, MERN Developer, Data Analyst..."
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
          />
          <button
            className="analyze-btn"
            onClick={handleAnalyze}
            disabled={loading}
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </div>
      </div>
      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="loading-text">Gathering market intelligence...</p>
        </div>
      )}
      {analysis && !loading && (
        <>
          <div className="analysis-role-header">
            <h2>{analysis.targetRole || targetRole}</h2>
            <div className="header-actions">
              {cached && <span className="cache-badge">Cached Result</span>}
              <button className="refresh-btn" onClick={handleRefresh}>
                Refresh Market Data
              </button>
            </div>
          </div>
          <div className="insights-grid">
            <div className="insight-card full-width">
              <h3>Demand Level</h3>
              <p>{formatText(analysis.demandLevel)}</p>
            </div>
            <div className="insight-card full-width">
              <h3>Market Summary</h3>
              <p>{formatText(analysis.marketSummary)}</p>
            </div>
            <div className="insight-card">
              <h3>Salary Insights</h3>
              <p>{formatText(analysis.salaryInsights)}</p>
            </div>
            <div className="insight-card">
              <h3>Future Outlook</h3>
              <p>{formatText(analysis.futureOutlook)}</p>
            </div>
            {/* Added missing .list-card class */}
            <div className="insight-card list-card">
              <h3>Top Roles</h3>
              <ul>
                {analysis.topRoles?.map((role, index) => (
                  <li key={index}>
                    <span className="list-dot"></span>
                    {role}
                  </li>
                ))}
              </ul>
            </div>
            <div className="insight-card">
              <h3>Recommended Skills</h3>
              <div className="skills-tags">
                {analysis.recommendedSkills?.map((skill, index) => (
                  <span key={index} className="skill-tag">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="jobs-section">
            <h2 className="section-title">Live Job Openings</h2>
            {jobs.length === 0 ? (
              <div className="empty-jobs">No job openings found currently.</div>
            ) : (
              <div className="jobs-grid">
                {jobs.map((job, index) => (
                  <div key={index} className="job-card">
                    {/* Implemented missing header elements layout */}
                    <div className="job-card-header">
                      <h3>{job.title}</h3>
                      <span className="geo-tag">
                        {job.location || "Remote"}
                      </span>
                    </div>
                    <p className="company-name">{job.company}</p>
                    <a
                      href={job.applyLink}
                      target="_blank"
                      rel="noreferrer"
                      className="apply-btn"
                    >
                      Apply Now
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};



export default JobAnalysis;