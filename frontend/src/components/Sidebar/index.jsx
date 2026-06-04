import { NavLink, useNavigate } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaSearch,
  FaUserGraduate,
  FaFileAlt,
  FaRobot,
  FaSignOutAlt,
  FaUserCircle,
} from 'react-icons/fa';
import './index.css';

// Grouped items to make the dual presence of Gap Analysis & Roadmaps logical
const coreMenu = [
  { path: '/dashboard', icon: <FaTachometerAlt />, label: 'Dashboard' },
  { path: '/gap-analysis', icon: <FaUserGraduate />, label: 'AI Skill Gap Analysis' },
  { path: '/resume-analyzer', icon: <FaFileAlt />, label: 'Resume Analyzer' },
];

const studioMenu = [
  { path: '/mock-interview', icon: <FaRobot />, label: 'Mock Interview System' },
  { path: '/job-match', icon: <FaSearch />, label: 'Smart Job Match' },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      {/* BRAND HEADER REGION */}
      <div className="sidebar-brand">
        <div className="brand-icon">U</div>
        <div>
          <h2>Upskillr</h2>
          <p>AI Career Accelerator</p>
        </div>
      </div>

      {/* CORE INTERACTIVE MENU */}
      <nav className="sidebar-nav">
        <p className="nav-label">ANALYZE</p>
        {coreMenu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            <div className="nav-icon">{item.icon}</div>
            <span>{item.label}</span>
          </NavLink>
        ))}

        <p className="nav-label" style={{ marginTop: '1rem' }}>GROW & LAND</p>
        {studioMenu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            <div className="nav-icon">{item.icon}</div>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* FOOTER METRICS SYSTEM & ACTIONS */}
      <div className="sidebar-bottom-group">
        <div className="sidebar-score-card">
          <div className="score-header">
            <span>Career Readiness</span>
            <span>75%</span>
          </div>
          <div className="score-bar">
            <div className="score-fill"></div>
          </div>
          <p className="score-text">
            Keep improving your profile to unlock better opportunities.
          </p>
        </div>

        {/* Changed to nav-item utility styling to ensure perfect visual alignment */}
        <NavLink
          to="/profile"
          className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
        >
          <div className="nav-icon"><FaUserCircle /></div>
          <span>Profile</span>
        </NavLink>
        
        <button type="button" className="sidebar-logout-btn" onClick={handleLogout}>
          <div className="nav-icon"><FaSignOutAlt /></div>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}