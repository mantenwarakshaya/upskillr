import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Added for seamless page routing
import axios from "axios";
import "./index.css";

export default function GapAnalysis() {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);

  const handleAnalyze = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:7777/api/analyze-skills",
        { withCredentials: true }
      );
      setResult(response.data.data);
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("Failed to analyze skills profile. Please ensure you are logged in.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRoadmap = async () => {
    try {
      setLoadingRoadmap(true);
      
      // Request generation from the backend
      await axios.get(
        "http://localhost:7777/api/roadmap",
        { withCredentials: true }
      );

      // UX Polish: Instantly pivot the user to their dedicated Roadmaps workspace tab
      navigate("/roadmaps");
    } catch (error) {
      console.error("Roadmap generation failed:", error);
      alert("Failed to compile target learning roadmap.");
    } finally {
      setLoadingRoadmap(false);
    }
  };

  return (
    <div className="gap-analysis-container">
      <div className="analysis-card">
        <header className="analysis-header">
          <h1>AI Skill Gap Analysis</h1>
          <p>Instantly evaluate your technical capabilities against current industry requirements.</p>
          <button className="primary-btn" onClick={handleAnalyze} disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span> Analyzing Profile...
              </>
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
              <p>Generate a customized, sequence-driven roadmap compiled specifically for your gaps.</p>
              <button 
                className="secondary-btn" 
                onClick={handleGenerateRoadmap} 
                disabled={loadingRoadmap}
              >
                {loadingRoadmap ? "Assembling Core Framework..." : "Generate Detailed Roadmap"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}