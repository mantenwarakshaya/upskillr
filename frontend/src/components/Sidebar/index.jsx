import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthProvider'; 

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

const coreMenu = [
  { path: '/resume-analyzer', icon: <FaFileAlt />, label: 'Resume Analyzer' },
  { path: '/gap-analysis', icon: <FaUserGraduate />, label: 'Skill Gap Analysis' },
];

const studioMenu = [
  { path: '/mock-interview', icon: <FaRobot />, label: 'Mock Interview' },
  { path: '/job-match', icon: <FaSearch />, label: 'Smart Job Match' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { logout } = useAuth(); // <-- Destructure logout helper out of global Auth context

  const handleLogout = async () => {
    try {
      await logout(); // 1. Deletes jwt_token via backend and clears user state
      navigate('/', { replace: true }); // 2. Forces user back to landing page channel
    } catch (err) {
      console.error("Logout execution failed: ", err);
    }
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
        <NavLink
          to="/dashboard"
          className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
        >
          <div className="nav-icon"><FaTachometerAlt /></div>
          <span>Dashboard</span>
        </NavLink>
        
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

        <NavLink
          to="/profile"
          className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
        >
          <div className="nav-icon"><FaUserCircle /></div>
          <span>Profile</span>
        </NavLink>
        
        {/* Executes async session removal cleanly */}
        <button type="button" className="sidebar-logout-btn" onClick={handleLogout}>
          <div className="nav-icon"><FaSignOutAlt /></div>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}