import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  FaUser,
  FaGithub,
  FaBriefcase,
  FaArrowLeft,
  FaLock,
  FaShieldAlt,
  FaTrashAlt,
  FaCheckCircle,
  FaCode
} from 'react-icons/fa';
import { LoaderView, ErrorView } from '../../Common';
import roles from '../../../data/roles';
import './index.css';

export default function EditProfile() {
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:7777';

  // Navigation Tab Controller State
  const [activeTab, setActiveTab] = useState('general');

  // Form Payload Structures
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    targetRole: '',
    github: '',
    skills: [] // Holds the user's selected skills
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Operation Management Flags
  const [initialLoading, setInitialLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [toast, setToast] = useState({ message: '', type: '' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 4000);
  };

  const getProfile = async () => {
    try {
      setInitialLoading(true);
      setErrorMsg(null);
      const response = await axios.get(`${BACKEND_URL}/api/me`, { withCredentials: true });
      const user = response.data.user;
      setProfileData({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        targetRole: user?.targetRole || '',
        github: user?.github || '',
        skills: user?.skills || [], // Hydrate skills from database
      });
    } catch (err) {
      console.error("Profile mounting lookup failed:", err);
      setErrorMsg(err.response?.data?.message || "Could not retrieve your profile parameters.");
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => { getProfile(); }, []);

  // Input Sync Handlers
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    
    // Clear skill selections if they switch roles entirely to keep data clean
    if (name === 'targetRole') {
      setProfileData({
        ...profileData,
        targetRole: value,
        skills: [] 
      });
    } else {
      setProfileData({ ...profileData, [name]: value });
    }
  };

  // Skill Selection Toggle Handler
  const handleSkillToggle = (skill) => {
    let updatedSkills = [...profileData.skills];
    if (updatedSkills.includes(skill)) {
      updatedSkills = updatedSkills.filter(s => s !== skill); // Remove if already exists
    } else {
      updatedSkills.push(skill); // Add if not selected
    }
    setProfileData({ ...profileData, skills: updatedSkills });
  };

  const handlePasswordChange = (e) => setPasswordData({ ...passwordData, [e.target.name]: e.target.value });

  // Submit Event Actions
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      // Sends both targetRole and selected skills array directly to backend
      await axios.patch(`${BACKEND_URL}/api/profile/edit`, profileData, { withCredentials: true });
      showToast("Professional identity and skills updated successfully.");
    } catch (err) {
      showToast(err.response?.data?.message || "Profile updates rejected.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (newPassword !== confirmPassword) {
      showToast('New password and confirm password are not the same', 'error');
      return;
    }

    const strengthRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!strengthRegex.test(newPassword)) {
      showToast('New password is too weak. Must be 8+ chars and include uppercase, lowercase, number, and symbol.', 'error');
      return;
    }

    try {
      setActionLoading(true);
      const response = await axios.patch(
        `${BACKEND_URL}/api/profile/password`, 
        { currentPassword, newPassword, confirmPassword }, 
        { withCredentials: true }
      );
      showToast(response.data.message || "Password updated successfully!");
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      let errorMsg = err.response?.data?.message || `${err.message || 'Network error'}`;
      showToast(errorMsg, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = window.confirm("WARNING: Are you sure you want to deactivate your account? Your workspace metrics will be hidden but can be fully restored within the next 7 days.");
    if (!confirmation) return;

    try {
      setActionLoading(true);
      await axios.delete(`${BACKEND_URL}/api/profile/delete`, { withCredentials: true });
      navigate('/login');
    } catch (err) {
      showToast(err.response?.data?.message || "Account deactivation command failed.", "error");
      setActionLoading(false);
    }
  };

  if (initialLoading) return <LoaderView />;
  if (errorMsg) return <ErrorView message={errorMsg} onRetry={getProfile} />;

  return (
    <div className="ep-profile-app-container">
      {toast.message && (
        <div className={`ep-toast-notification ${toast.type}`}>
          {toast.type === 'error' ? <FaShieldAlt /> : <FaCheckCircle />}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="ep-profile-dashboard-layout">
        <section className="ep-profile-identity-header">
          <div className="ep-identity-flex-container">
            <button className="profile-back-trigger" onClick={() => navigate('/profile')}>
              <FaArrowLeft />
              <span>Back to Profile</span>
            </button>
            <div className="ep-identity-meta-box">
              <h1>Workspace Settings</h1>
              <p>Configure personal, system access keys, and workspace operational behaviors.</p>
            </div>
          </div>

          <nav className="ep-profile-navigation-tabs">
            <button className={`ep-tab-link ${activeTab === 'general' ? 'ep-active' : ''}`} onClick={() => setActiveTab('general')}>General Setup</button>
            <button className={`ep-tab-link ${activeTab === 'security' ? 'ep-active' : ''}`} onClick={() => setActiveTab('security')}>Security Keys</button>
            <button className={`ep-tab-link ${activeTab === 'danger' ? 'ep-active' : ''}`} onClick={() => setActiveTab('danger')}>Danger Zone</button>
          </nav>
        </section>

        <section className="ep-profile-form-surface">
          {activeTab === 'general' && (
            <form onSubmit={handleSaveProfile} className="ep-animate-fade-in">
              <div className="ep-form-section-header">
                <h3>Personal Information</h3>
                <p>Basic details to help power target role tracking optimizations.</p>
              </div>
              <div className="ep-form-grid-layout">
                <div className="ep-field-container">
                  <label htmlFor="firstName">First Name</label>
                  <div className="profile-input-field-wrapper">
                    <FaUser className="field-adornment-icon" />
                    <input id="firstName" type="text" name="firstName" value={profileData.firstName} onChange={handleProfileChange} required />
                  </div>
                </div>
                <div className="ep-field-container">
                  <label htmlFor="lastName">Last Name</label>
                  <div className="profile-input-field-wrapper">
                    <FaUser className="field-adornment-icon" />
                    <input id="lastName" type="text" name="lastName" value={profileData.lastName} onChange={handleProfileChange} />
                  </div>
                </div>
              </div>
              
              <div className="ep-form-grid-layout">
                <div className="ep-field-container">
                  <label htmlFor="targetRole">Target Role Context</label>
                  <div className="profile-input-field-wrapper">
                    <FaBriefcase className="field-adornment-icon" />
                    <select id="targetRole" name="targetRole" value={profileData.targetRole} onChange={handleProfileChange} required>
                      <option value="">Select Target Role</option>
                      {Object.keys(roles).map((roleKey) => (
                        <option key={roleKey} value={roleKey}>{roleKey}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="ep-field-container">
                  <label htmlFor="github">GitHub Integration</label>
                  <div className="profile-input-field-wrapper">
                    <FaGithub className="field-adornment-icon" />
                    <input id="github" type="url" name="github" value={profileData.github} onChange={handleProfileChange} placeholder="https://github.com/username" />
                  </div>
                </div>
              </div>

              {/* DYNAMIC SKILLS SECTION */}
              {profileData.targetRole && roles[profileData.targetRole] && (
                <div className="ep-skills-selection-section ep-animate-fade-in">
                  <div className="ep-form-section-header" style={{ marginTop: '2rem' }}>
                    <h3>Select Core Stack Competencies</h3>
                    <p>Click on the technologies you are proficient in for the role of <strong>{profileData.targetRole}</strong>.</p>
                  </div>
                  <div className="ep-skills-badges-grid">
                    {roles[profileData.targetRole].map((skill) => {
                      const isSelected = profileData.skills.includes(skill);
                      return (
                        <button
                          type="button"
                          key={skill}
                          className={`ep-skill-badge-btn ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleSkillToggle(skill)}
                        >
                          <FaCode className="badge-icon" />
                          <span>{skill}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <button type="submit" className="ep-sync-profile-btn" disabled={actionLoading} style={{ marginTop: '2rem' }}>
                {actionLoading ? 'Updating System State...' : 'Save Workspace Changes'}
              </button>
            </form>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handleUpdatePassword} className="ep-animate-fade-in">
              <div className="ep-form-section-header">
                <h3>Update Security Password</h3>
                <p>Ensure your account workspace maintains robust authorization access points.</p>
              </div>
              <div className="ep-single-stack-layout">
                <div className="ep-field-container">
                  <label htmlFor="currentPassword">Current Password</label>
                  <div className="profile-input-field-wrapper">
                    <FaLock className="field-adornment-icon" />
                    <input id="currentPassword" type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} placeholder="••••••••" required />
                  </div>
                </div>
                <div className="ep-field-container">
                  <label htmlFor="newPassword">New Password</label>
                  <div className="profile-input-field-wrapper">
                    <FaLock className="field-adornment-icon" />
                    <input id="newPassword" type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} placeholder="••••••••" required />
                  </div>
                </div>
                <div className="ep-field-container">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <div className="profile-input-field-wrapper">
                    <FaLock className="field-adornment-icon" />
                    <input id="confirmPassword" type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} placeholder="••••••••" required />
                  </div>
                </div>
              </div>
              <button type="submit" className="ep-sync-profile-btn security" disabled={actionLoading}>
                {actionLoading ? 'Refreshing Authorization Vault...' : 'Commit New Password'}
              </button>
            </form>
          )}

          {activeTab === 'danger' && (
            <div className="ep-animate-fade-in ep-danger-zone-container">
              <div className="ep-form-section-header danger-header">
                <h3>Temporary Workspace Deactivation</h3>
                <p>Deauthenticating your workspace suspends your active sessions safely.</p>
              </div>
              <div className="danger-notice-infobox">
                <h5>Account Deactivation Manifest:</h5>
                <ul>
                  <li>Your user profile record will be marked hidden/inactive immediately.</li>
                  <li>Your configurations are saved securely and trackable for a 7-day recovery period.</li>
                  <li>Logging back in or using recovery credentials within 7 days restores all data metrics.</li>
                </ul>
              </div>
              <button type="button" className="ep-destroy-account-btn" onClick={handleDeleteAccount} disabled={actionLoading}>
                <FaTrashAlt />
                <span>{actionLoading ? 'Deactivating Profile Structure...' : 'Deactivate Workspace'}</span>
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}