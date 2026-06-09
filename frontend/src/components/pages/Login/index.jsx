import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthProvider"; // 1. Import your auth context hook

import { FaEye, FaEyeSlash } from "react-icons/fa";
import { MdEmail, MdLock } from "react-icons/md";
import logo from "../../../assets/nav_logo.png";
import "./index.css";

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || "http://localhost:7777";

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth(); // 2. Extract setUser to globally save the logged-in user

  const [formData, setFormData] = useState({
    emailId: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Restoration properties
  const [showRestore, setShowRestore] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (errorMsg) setErrorMsg("");
    if (successMsg) setSuccessMsg("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    setShowRestore(false);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/login`,
        formData,
        { withCredentials: true } // Crucial for receiving cookies from your API server
      );

      // 3. Make sure user state is registered globally so ProtectedRoute lets them in instantly
      if (response.data?.user) {
        setUser(response.data.user);
      }

      navigate("/dashboard", { replace: true });
    } catch (err) {
      const errorData = err.response?.data;
      let message = errorData?.message || "Invalid email or password. Please try again.";

      if (errorData?.code === "ACCOUNT_DEACTIVATED") {
        setShowRestore(true);
        setIsLoading(false);
        return;
      }

      setFormData((prev) => ({ ...prev, password: "" }));
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreAccount = async () => {
    if (!formData.emailId || !formData.password) {
      setErrorMsg("Please enter both email and password to restore your account.");
      return;
    }

    setIsRestoring(true);
    setErrorMsg("");

    try {
      const response = await axios.post(`${API_BASE_URL}/api/restore-account`, {
        emailId: formData.emailId,
        password: formData.password,
      });

      setShowRestore(false);
      setSuccessMsg(response.data?.message || "Account restored successfully! You can sign in now.");
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Account restoration failed. Please try again.");
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="login-viewport">
      {/* LEFT BRAND SIDE PANEL */}
      <div className="login-aside-brand">
        <div className="radial-overlay"></div>
        <div className="aside-content">
          <img src={logo} alt="Upskillr" className="brand-logo-img" />
          <div className="hero-status-badge">AI Career Intelligence</div>
          <h1 className="aside-heading">
            Bridge the Gap Between
            <span> Skills & Success</span>
          </h1>
          <p className="aside-desc">
            Analyze your resume, GitHub, projects, and career profile with AI-powered insights.
          </p>
          <div className="stats-glass-grid">
            <div className="stat-glass-card">
              <h2>10K+</h2>
              <span>Career Analyses</span>
            </div>
            <div className="stat-glass-card">
              <h2>95%</h2>
              <span>ATS Optimization</span>
            </div>
            <div className="stat-glass-card">
              <h2>AI</h2>
              <span>Mock Interviews</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT AUTH CONSOLE SIDE */}
      <div className="login-main-auth">
        <form className="auth-surface-card" onSubmit={handleLogin}>
          <div className="auth-card-header">
            <h2>Welcome Back</h2>
            <p>Continue your AI career growth journey</p>
          </div>

          <div className="auth-input-group">
            <label htmlFor="emailId">Email Address</label>
            <div className="interactive-input-wrapper">
              <MdEmail className="input-field-icon" />
              <input
                id="emailId"
                type="email"
                name="emailId"
                placeholder="name@gmail.com"
                value={formData.emailId}
                onChange={handleChange}
                disabled={isLoading || isRestoring}
                required
              />
            </div>
          </div>

          <div className="auth-input-group">
            <label htmlFor="password">Password</label>
            <div className="interactive-input-wrapper">
              <MdLock className="input-field-icon" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading || isRestoring}
                required
              />
              <button
                type="button"
                className="password-toggle-trigger"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                disabled={isLoading || isRestoring}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {showRestore && (
            <div className="restore-box">
              <p className="restore-text">
                Your account is currently deactivated. You can restore it immediately below.
              </p>
              <button
                type="button"
                className="action-submit-btn restore-btn"
                onClick={handleRestoreAccount}
                disabled={isRestoring}
              >
                {isRestoring ? "Restoring Profile..." : "Restore Account Now"}
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="status-error-box" role="alert">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="status-success-box" role="alert">
              {successMsg}
            </div>
          )}

          <button
            type="submit"
            className="action-submit-btn"
            disabled={isLoading || isRestoring}
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>

          <div className="switch-auth-context">
            New to Upskillr?{" "}
            <Link to="/signup" className="context-action-link">
              Create Account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}