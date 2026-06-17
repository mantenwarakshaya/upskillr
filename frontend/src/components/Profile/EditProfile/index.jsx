import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  FaArrowLeft, 
  FaCheckCircle, 
  FaShieldAlt, 
  FaUser, 
  FaBriefcase, 
  FaGithub, 
  FaLock, 
  FaTrashAlt 
} from "react-icons/fa";
import "./index.css";

const API_BASE_URL = import.meta.env?.VITE_API_URL || "http://localhost:7777";

export default function EditProfile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("general");
  
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    targetRole: "",
    github: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  const [initialLoading, setInitialLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [toast, setToast] = useState({ message: "", type: "" });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 3000); 
  };

  const getProfile = async () => {
    try {
      setInitialLoading(true);
      setErrorMsg("");
      const response = await axios.get(`${API_BASE_URL}/api/me`, { withCredentials: true });
      const user = response.data?.user;
      setProfileData({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        targetRole: user?.targetRole || "",
        github: user?.github || "",
      });
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Could not retrieve your profile.");
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    setPasswordData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await axios.patch(`${API_BASE_URL}/api/profile/edit`, profileData, { withCredentials: true });
      showToast("Profile updated successfully!", "success");
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to update profile.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast("New passwords do not match.", "error");
      return;
    }
    try {
      setActionLoading(true);
      await axios.patch(`${API_BASE_URL}/api/profile/password`, passwordData, { withCredentials: true });
      showToast("Password updated successfully!", "success");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to update password.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to deactivate your account?")) return;
    try {
      setActionLoading(true);
      await axios.delete(`${API_BASE_URL}/api/profile/delete`, { withCredentials: true });
      navigate("/", { replace: true });
    } catch (error) {
      showToast("Failed to deactivate account.", "error");
      setActionLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="ep-intel-workspace ep-state-centered">
        <div className="ep-workspace-spinner-text">Loading parameters...</div>
      </div>
    );
  }
  
  if (errorMsg) {
    return (
      <div className="ep-intel-workspace ep-state-centered">
        <div className="ep-workspace-error-text">{errorMsg}</div>
      </div>
    );
  }

  const renderActiveStream = () => {
    switch (activeTab) {
      case "general":
        return (
          <div className="ep-bento-panel">
            <h2 className="ep-panel-title">Personal Information</h2>
            <form className="ep-workspace-form" onSubmit={handleSaveProfile}>
              <div className="ep-bento-quad-grid">
                <div className="ep-field">
                  <label htmlFor="firstName">First Name</label>
                  <div className="ep-search-dock-card">
                    <FaUser className="ep-icon-muted" />
                    <input id="firstName" name="firstName" value={profileData.firstName} onChange={handleProfileChange} required placeholder="Enter first name" />
                  </div>
                </div>
                <div className="ep-field">
                  <label htmlFor="lastName">Last Name</label>
                  <div className="ep-search-dock-card">
                    <FaUser className="ep-icon-muted" />
                    <input id="lastName" name="lastName" value={profileData.lastName} onChange={handleProfileChange} placeholder="Enter last name" />
                  </div>
                </div>
                <div className="ep-field">
                  <label htmlFor="targetRole">Target Role</label>
                  <div className="ep-search-dock-card">
                    <FaBriefcase className="ep-icon-muted" />
                    <input id="targetRole" name="targetRole" value={profileData.targetRole} onChange={handleProfileChange} required placeholder="e.g., Mern Developer" />
                  </div>
                </div>
                <div className="ep-field">
                  <label htmlFor="github">GitHub Link</label>
                  <div className="ep-search-dock-card">
                    <FaGithub className="ep-icon-muted" />
                    <input id="github" name="github" type="url" value={profileData.github} onChange={handleProfileChange} placeholder="https://github.com/username" />
                  </div>
                </div>
              </div>
              <div className="ep-form-action-footer">
                <button type="submit" className="ep-primary-action" disabled={actionLoading}>
                  {actionLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        );
      case "security":
        return (
          <div className="ep-bento-panel">
            <h2 className="ep-panel-title">Security Settings</h2>
            <form className="ep-workspace-form" onSubmit={handleUpdatePassword}>
              <div className="ep-bento-vertical-stack">
                <div className="ep-field">
                  <label htmlFor="currentPassword">Current Password</label>
                  <div className="ep-search-dock-card">
                    <FaLock className="ep-icon-muted" />
                    <input id="currentPassword" type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} required placeholder="••••••••" />
                  </div>
                </div>
                <div className="ep-field">
                  <label htmlFor="newPassword">New Password</label>
                  <div className="ep-search-dock-card">
                    <FaLock className="ep-icon-muted" />
                    <input id="newPassword" type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} required placeholder="••••••••" />
                  </div>
                </div>
                <div className="ep-field">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <div className="ep-search-dock-card">
                    <FaLock className="ep-icon-muted" />
                    <input id="confirmPassword" type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} required placeholder="••••••••" />
                  </div>
                </div>
              </div>
              <div className="ep-form-action-footer">
                <button type="submit" className="ep-primary-action" disabled={actionLoading}>
                  {actionLoading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        );
      case "danger":
        return (
          <div className="ep-bento-panel">
            <h2 className="ep-panel-title ep-text-danger">Account Status Management</h2>
            <div className="ep-danger-notice-box">
              <p className="ep-danger-notice-desc">
                Deactivating your profile hides your workspace immediately. You retain a 7-day recovery phase window before permanent erasure.
              </p>
            </div>
            <div className="ep-form-action-footer ep-containment-left">
              <button type="button" onClick={handleDeleteAccount} className="ep-btn-danger" disabled={actionLoading}>
                <FaTrashAlt /> {actionLoading ? "Deactivating..." : "Deactivate Workspace"}
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="ep-intel-workspace">
      {toast.message && (
        <div className={`ep-toast-notification ${toast.type}`}>
          {toast.type === "error" ? <FaShieldAlt className="ep-toast-icon" /> : <FaCheckCircle className="ep-toast-icon" />}
          <span className="ep-toast-message-text">{toast.message}</span>
        </div>
      )}

      <main className="ep-grid-shell">
        <header className="ep-job-header-anchor">
          <button type="button" className="ep-back-action" onClick={() => navigate("/profile")}>
            <FaArrowLeft /> Back to Profile
          </button>
          <h1 className="ep-main-title">Workspace Settings</h1>
          <p className="ep-sub-title">Configure profile details, security, and account status.</p>
        </header>

        <nav className="ep-tab-navigation">
          {["general", "security", "danger"].map((tab) => (
            <button 
              key={tab}
              type="button"
              className={`ep-tab-trigger ${activeTab === tab ? "active" : ""}`} 
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>

        <section className="ep-workspace-block-card">
          {renderActiveStream()}
        </section>
      </main>
    </div>
  );
}