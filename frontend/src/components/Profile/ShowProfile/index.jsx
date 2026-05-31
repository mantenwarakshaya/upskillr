import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  FaGithub,
  FaUserGraduate,
  FaEnvelope,
  FaEdit,
  FaCheckCircle,
  FaCalendarAlt,
  FaFilePdf,
  FaExclamationCircle,
  FaCode // Added icon for skills section
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { LoaderView, ErrorView } from '../../Common'; 
import './index.css';

export default function ShowProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const getProfile = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      
      const response = await axios.get('http://localhost:7777/api/me', {
        withCredentials: true,
      });
      setUser(response.data.user);
    } catch (err) {
      console.error("Profile payload processing failed:", err);
      const backendMessage = err.response?.data?.message || "Could not retrieve your profile tracking metrics.";
      setErrorMsg(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  if (loading) return <LoaderView />;
  if (errorMsg) return <ErrorView message={errorMsg} onRetry={getProfile} />;

  return (
    <div className="profile-page-wrapper">
      <div className="profile-surface-card">
        
        {/* TOP SECTION */}
        <div className="profile-hero-header">
          <div className="profile-identity-group">
            <div className="profile-avatar-sphere">
              {user?.firstName?.charAt(0).toUpperCase()}
            </div>

            <div className="profile-meta-details">
              <h1>
                {user?.firstName} {user?.lastName || ''}
              </h1>
              <p className="profile-email-row">
                <FaEnvelope className="row-icon" />
                <span>{user?.emailId}</span>
              </p>
              <div className="role-pill-badge">
                <FaUserGraduate className="row-icon" />
                <span>{user?.targetRole}</span>
              </div>
            </div>
          </div>

          <Link to="/profile/edit" className="edit-profile-trigger">
            <FaEdit />
            <span>Edit Profile</span>
          </Link>
        </div>

        {/* OVERVIEW METRICS */}
        <div className="profile-content-section">
          <h2 className="section-title">Profile Overview</h2>
          <div className="overview-stats-grid">
            
            <div className="overview-metric-box">
              <span className="metric-label">Account Status</span>
              <div className="metric-value">
                {user?.isVerified ? (
                  <span className="status-badge verified">
                    <FaCheckCircle /> Verified Account
                  </span>
                ) : (
                  <span className="status-badge unverified">
                    <FaExclamationCircle /> Unverified Account
                  </span>
                )}
              </div>
            </div>

            <div className="overview-metric-box">
              <span className="metric-label">Target Role</span>
              <div className="metric-value text-highlight">
                {user?.targetRole}
              </div>
            </div>

            <div className="overview-metric-box">
              <span className="metric-label">Joined On</span>
              <div className="metric-value date-readout">
                <FaCalendarAlt className="inline-icon" />
                <span>
                  {user?.createdAt 
                    ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) 
                    : 'N/A'}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* DYNAMIC SKILLS SHOWCASE SECTION */}
        <div className="profile-content-section">
          <h2 className="section-title">Core Stack Competencies</h2>
          {user?.skills && user.skills.length > 0 ? (
            <div className="profile-skills-pills-container">
              {user.skills.map((skill, index) => (
                <div key={index} className="profile-skill-static-pill">
                  <FaCode className="skill-pill-icon" />
                  <span>{skill}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-skills-notice">
              No skills selected yet. Click on "Edit Profile" to configure your technical stack competencies.
            </div>
          )}
        </div>

        {/* EXTERNAL INTEGRATIONS */}
        <div className="profile-split-assets-grid">
          
          <div className="profile-content-section asset-box">
            <h2 className="section-title">GitHub Portfolio</h2>
            {user?.github ? (
              <a href={user.github} target="_blank" rel="noreferrer" className="asset-action-anchor github">
                <FaGithub />
                <span>Open GitHub Workspace</span>
              </a>
            ) : (
              <div className="empty-inline-notice">
                GitHub integration link has not been added yet.
              </div>
            )}
          </div>

          <div className="profile-content-section asset-box">
            <h2 className="section-title">Resume Repository</h2>
            {user?.resumeUrl ? (
              <a href={user.resumeUrl} target="_blank" rel="noreferrer" className="asset-action-anchor resume">
                <FaFilePdf />
                <span>View Stored Resume PDF</span>
              </a>
            ) : (
              <div className="empty-inline-notice">
                No indexed resume files detected.
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}