import { useState } from "react";
import roles from "../../../data/roles";
import "./index.css";

const ResumeAnalyzer = () => {
  const [targetRole, setTargetRole] = useState("");
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const availableRoles = Object.keys(roles || {});

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!resume || !targetRole) {
      alert("Please select a role and upload a resume");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const formData = new FormData();
      formData.append("targetRole", targetRole);
      formData.append("resume", resume);

      const response = await fetch("http://localhost:7777/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to analyze resume");
      }

      console.log(data);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const analysis = result?.analysis;
  const aiAnalysis = result?.aiAnalysis;

  return (
    <div className="resume-analyzer-container">
      <div className="resume-card">
        <h1 className="page-title">Resume Analyzer</h1>

        <form onSubmit={handleSubmit} className="analyzer-form">
          <div className="form-group">
            <label>Target Role</label>
            <select
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
            <label>Upload Resume</label>
            <div className="file-input-wrapper">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setResume(e.target.files[0])}
              />
            </div>
          </div>

          <button type="submit" className="analyze-btn" disabled={loading}>
            {loading ? "Analyzing..." : "Analyze Resume"}
          </button>
        </form>

        {error && (
          <div className="error-box">
            <strong>Error:</strong> {error}
          </div>
        )}

        {result?.success && analysis && (
          <div className="results-section">
            <h2>Analysis Result</h2>

            <div className="match-box">
              <span>Match Percentage</span>
              <h3>{analysis.matchPercentage}%</h3>
            </div>

            <div className="result-block">
              <h3>📄 Extracted Skills</h3>
              {result.extractedSkills?.length > 0 ? (
                <div className="skill-container">
                  {result.extractedSkills.map((skill) => (
                    <span key={skill} className="skill-tag extracted">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="no-data-text">No skills detected.</p>
              )}
            </div>

            <div className="result-block">
              <h3>✅ Strengths</h3>
              {analysis.strengths?.length > 0 ? (
                <div className="skill-container">
                  {analysis.strengths.map((skill) => (
                    <span key={skill} className="skill-tag strength">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="no-data-text">No matching skills found.</p>
              )}
            </div>

            <div className="result-block">
              <h3>⚠️ Missing Skills</h3>
              {analysis.missingSkills?.length > 0 ? (
                <div className="skill-container">
                  {analysis.missingSkills.map((skill) => (
                    <span key={skill} className="skill-tag missing-tag">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="no-data-text">No missing skills.</p>
              )}
            </div>

            <div className="result-block">
              <h3>🗺️ Learning Roadmap</h3>
              {analysis.roadmap?.length > 0 ? (
                <div className="skill-container">
                  {analysis.roadmap.map((skill) => (
                    <span key={skill} className="skill-tag roadmap">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="no-data-text">No roadmap generated.</p>
              )}
            </div>

            {aiAnalysis && (
              <div className="ai-analysis-section">
                <h2>🤖 AI Resume Analysis</h2>

                <div className="match-box score-box">
                  <span>Overall AI Score</span>
                  <h3>{aiAnalysis.overallScore}/100</h3>
                </div>

                <div className="result-block">
                  <h3>🎯 Candidate Level</h3>
                  <p className="ai-text-content">{aiAnalysis.candidateLevel}</p>
                </div>

                <div className="result-block">
                  <h3>📝 AI Summary</h3>
                  <p className="ai-text-content">{aiAnalysis.summary}</p>
                </div>

                <div className="result-block">
                  <h3>💪 AI Strengths</h3>
                  {aiAnalysis.strengths?.length > 0 ? (
                    <div className="banners-container">
                      {aiAnalysis.strengths.map((strength, index) => (
                        <div key={index} className="analysis-banner strength-banner">
                          {strength}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-data-text">No strengths identified.</p>
                  )}
                </div>

                <div className="result-block">
                  <h3>⚠️ Areas for Improvement</h3>
                  {aiAnalysis.weaknesses?.length > 0 ? (
                    <div className="banners-container">
                      {aiAnalysis.weaknesses.map((weakness, index) => (
                        <div key={index} className="analysis-banner improvement-banner">
                          {weakness}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-data-text">No weaknesses identified.</p>
                  )}
                </div>

                <div className="result-block">
                  <h3>🚀 Project Evaluation</h3>
                  <p className="ai-text-content">{aiAnalysis.projectEvaluation}</p>
                </div>

                <div className="result-block">
                  <h3>📄 Resume Feedback</h3>
                  {aiAnalysis.resumeFeedback?.length > 0 ? (
                    <ul className="feedback-list">
                      {aiAnalysis.resumeFeedback.map((feedback, index) => (
                        <li key={index}>{feedback}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="no-data-text">No feedback available.</p>
                  )}
                </div>

                <div className="result-block">
                  <h3>🎓 Career Recommendations</h3>
                  {aiAnalysis.careerRecommendations?.length > 0 ? (
                    <ul className="feedback-list">
                      {aiAnalysis.careerRecommendations.map((recommendation, index) => (
                        <li key={index}>{recommendation}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="no-data-text">No recommendations available.</p>
                  )}
                </div>

                <div className="result-block">
                  <h3>🎤 Interview Readiness</h3>
                  <p className="ai-text-content">{aiAnalysis.interviewReadiness}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeAnalyzer;