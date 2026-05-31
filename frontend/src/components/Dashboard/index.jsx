import { Link } from 'react-router-dom';
import {
  FaSearch,
  FaUserGraduate,
  FaFileAlt,
  FaRoute,
  FaRobot,
} from 'react-icons/fa';
import './index.css';

const quickActions = [
  { path: '/gap-analysis', title: 'AI Skill Gap Analysis', desc: 'Compare your stack directly against target roles to find gaps.', icon: <FaUserGraduate /> },
  { path: '/resume-analyzer', title: 'Resume Analyzer', desc: 'Optimize your resume metrics and keywords for deep ATS parsing.', icon: <FaFileAlt /> },
  { path: '/roadmaps', title: 'Personalized Roadmaps', desc: 'Accelerate your growth with custom daily and weekly structured schedules.', icon: <FaRoute /> },
  { path: '/mock-interview', title: 'Mock Interview System', desc: 'Practice technical, HR, and DSA tracks with precise feedback.', icon: <FaRobot /> },
  { path: '/job-match', title: 'Smart Job Match', desc: 'Pull highly compatible roles directly from real-time search vectors.', icon: <FaSearch /> },
];

export default function Dashboard() {
  return (
    <div className="dashboard-content-container">
      {/* HEADER SYSTEM */}
      <header className="dashboard-header">
        <div>
          <h1>Welcome back, Developer 👋</h1>
          <p>Your AI-powered career intelligence dashboard is ready.</p>
        </div>
        <div className="header-badge">Upskillr AI</div>
      </header>

      {/* METRICS & OVERVIEW DATA HIGHLIGHTS */}
      <section className="stats-grid">
        <div className="stat-card primary">
          <h3>Career Readiness</h3>
          <div className="score-large">75%</div>
          <p>You're 25% away from your target role.</p>
        </div>

        <div className="stat-card">
          <h3>Active Applications</h3>
          <div className="score-large">4</div>
          <p>Tracked via Smart Job Match</p>
        </div>
      </section>

      {/* QUICK ACTIONS ACCELERATOR TRACK */}
      <section className="quick-actions">
        <div className="section-title">
          <h2>Your Career Accelerator</h2>
          <p>Core tools to boost your job readiness</p>
        </div>

        <div className="action-grid">
          {quickActions.map((item) => (
            <Link to={item.path} className="action-card" key={item.path}>
              <div className="action-icon">{item.icon}</div>
              <h4>{item.title}</h4>
              <p>{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}