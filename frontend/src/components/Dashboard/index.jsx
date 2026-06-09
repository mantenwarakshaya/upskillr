import { Link } from "react-router-dom";
import {
  FaFileAlt,
  FaUserGraduate,
  FaRobot,
  FaSearch,
} from "react-icons/fa";
import "./index.css";

const quickActions = [
  {
    path: "/resume-analyzer",
    title: "Resume Analyzer",
    desc: "Upload your resume and get AI-powered analysis.",
    icon: <FaFileAlt />,
  },
  {
    path: "/gap-analysis",
    title: "Skill Gap Analysis",
    desc: "Discover missing skills and generate a roadmap.",
    icon: <FaUserGraduate />,
  },
  {
    path: "/mock-interview",
    title: "Mock Interview",
    desc: "Practice interviews and receive feedback.",
    icon: <FaRobot />,
  },
  {
    path: "/job-match",
    title: "Smart Job Match",
    desc: "Find relevant jobs and market insights.",
    icon: <FaSearch />,
  },
];

export default function Dashboard() {
  return (
    <div className="dashboard-content-container">
      <header className="dashboard-header">
        <div>
          <h1>Welcome to Upskillr 🚀</h1>
          <p>
            Your AI-powered career growth platform designed to help you
            analyze, improve, and land your target role.
          </p>
        </div>

        <div className="header-badge">
          AI Career Accelerator
        </div>
      </header>

      <section className="stats-grid">
        <div className="stat-card primary">
          <h3>Career Readiness</h3>
          <div className="score-large">--</div>
          <p>Complete Resume Analysis to begin.</p>
        </div>

        <div className="stat-card">
          <h3>Target Role Match</h3>
          <div className="score-large">--</div>
          <p>Generated after Skill Gap Analysis.</p>
        </div>
      </section>

      <section className="quick-actions">
        <div className="section-title">
          <h2>Your Career Accelerator</h2>
          <p>Follow the recommended journey below.</p>
        </div>

        <div className="action-grid">
          {quickActions.map((item) => (
            <Link
              to={item.path}
              className="action-card"
              key={item.path}
            >
              <div className="action-icon">{item.icon}</div>

              <h4>{item.title}</h4>

              <p>{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="career-journey">
        <div className="section-title">
          <h2>Career Journey</h2>
          <p>Your recommended Upskillr workflow</p>
        </div>

        <div className="journey-container">
          <div className="journey-step">
            <span>1</span>
            <h4>Resume Analyzer</h4>
          </div>

          <div className="journey-arrow">→</div>

          <div className="journey-step">
            <span>2</span>
            <h4>Skill Gap Analysis</h4>
          </div>

          <div className="journey-arrow">→</div>

          <div className="journey-step">
            <span>3</span>
            <h4>Career Roadmap</h4>
          </div>

          <div className="journey-arrow">→</div>

          <div className="journey-step">
            <span>4</span>
            <h4>Mock Interview</h4>
          </div>

          <div className="journey-arrow">→</div>

          <div className="journey-step">
            <span>5</span>
            <h4>Smart Job Match</h4>
          </div>
        </div>
      </section>
    </div>
  );
}