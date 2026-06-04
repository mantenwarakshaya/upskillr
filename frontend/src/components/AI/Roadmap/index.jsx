import React from "react";
import "./index.css"; 

export default function Roadmap({ roadmapData }) {
  if (!roadmapData) return null;

  return (
    <div className="detailed-roadmap-wrapper">
      {/* Target Role & Banner Header */}
      <div className="roadmap-header-banner">
        <div className="banner-left">
          <span className="banner-subtitle">Target Career Objective</span>
          <h2>{roadmapData.targetRole || "MERN Stack Developer"}</h2>
        </div>
        <div className="duration-tag">
          <span className="icon">⏱️</span>
          <div>
            <span className="tag-label">Estimated Track</span>
            <strong>{roadmapData.totalEstimatedDuration}</strong>
          </div>
        </div>
      </div>

      {/* Sequential Phase Timeline Wrapper */}
      <div className="timeline-container">
        {roadmapData.roadmap?.map((phase, pIdx) => (
          <div key={pIdx} className="timeline-phase-card">
            {/* Numeric Badge Identifier Line */}
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
  );
}