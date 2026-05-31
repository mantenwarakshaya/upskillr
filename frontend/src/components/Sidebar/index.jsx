import { NavLink, useNavigate } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaSearch,
  FaUserGraduate,
  FaFileAlt,
  FaRoute,
  FaRobot,
  FaSignOutAlt,
  FaUserCircle,
} from 'react-icons/fa';
import './index.css';

const navItems = [
  { path: '/dashboard', icon: <FaTachometerAlt />, label: 'Dashboard' },
  { path: '/gap-analysis', icon: <FaUserGraduate />, label: 'AI Skill Gap Analysis' },
  { path: '/resume-analyzer', icon: <FaFileAlt />, label: 'Resume Analyzer' },
  { path: '/roadmaps', icon: <FaRoute />, label: 'Personalized Roadmaps' },
  { path: '/mock-interview', icon: <FaRobot />, label: 'Mock Interview System' },
  { path: '/job-match', icon: <FaSearch />, label: 'Smart Job Match' },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear user tokens/cookies here if needed
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
        <p className="nav-label">MAIN MENU</p>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive ? 'nav-item active' : 'nav-item'
            }
          >
            <div className="nav-icon">{item.icon}</div>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* FOOTER METRICS SYSTEM & ACTIONS */}
      <div className="sidebar-bottom-group">
        {/* Isolated Career Readiness Card Box */}
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

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            isActive
              ? 'sidebar-profile-btn active-profile'
              : 'sidebar-profile-btn'
          }
        >
          <FaUserCircle className="logout-icon" />
          <span>Profile</span>
        </NavLink>
        
        {/* Separated and Stylized Semantic Logout Trigger */}
        <button type="button" className="sidebar-logout-btn" onClick={handleLogout}>
          <FaSignOutAlt className="logout-icon" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}