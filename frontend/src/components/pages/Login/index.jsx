import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

import { FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";
import { MdEmail, MdLock } from "react-icons/md";
import logo from "../../../assets/nav_logo.png";
import "./index.css";

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || "http://localhost:7777";

export default function Login() {
  const navigate = useNavigate();

  // Mode controllers: "LOGIN" or "FORGOT_PASSWORD"
  const [viewMode, setViewMode] = useState("LOGIN");

  const [formData, setFormData] = useState({
    emailId: "",
    password: "",
  });

  const [forgotEmail, setForgotEmail] = useState("");
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
      await axios.post(
        `${API_BASE_URL}/api/login`,
        formData,
        { withCredentials: true }
      );
      navigate("/dashboard");
    } catch (err) {
      const errorData = err.response?.data;
      let message = errorData?.message || "Invalid email or password. Please try again.";

      if (errorData?.code === "ACCOUNT_DEACTIVATED") {
        setShowRestore(true);
        setIsLoading(false);
        return;
      }

      if (message.toLowerCase().includes("verify")) {
        message = "📩 Please verify your email address before attempting to sign in.";
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

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const response = await axios.post(`${API_BASE_URL}/api/forgot-password`, {
        emailId: forgotEmail,
      });
      setSuccessMsg(response.data?.message || "📩 Recovery link dispatched! Please check your email inbox.");
      setForgotEmail("");
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Could not complete recovery request. Verify your entry.");
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (mode) => {
    setViewMode(mode);
    setErrorMsg("");
    setSuccessMsg("");
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
        {viewMode === "LOGIN" ? (
          /* ======================================= */
          /* DEFAULT LOGIN VIEW MODE                 */
          /* ======================================= */
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
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="options-meta-row">
              <button 
                type="button" 
                className="forgot-password-link" 
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                onClick={() => switchMode("FORGOT_PASSWORD")}
              >
                Forgot password?
              </button>
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

            {errorMsg && <div className="status-error-box" role="alert">{errorMsg}</div>}
            {successMsg && <div className="status-success-box" role="alert">{successMsg}</div>}

            <button type="submit" className="action-submit-btn" disabled={isLoading || isRestoring}>
              {isLoading ? "Signing In..." : "Sign In"}
            </button>

            <div className="switch-auth-context">
              New to Upskillr?{" "}
              <Link to="/signup" className="context-action-link">
                Create Account
              </Link>
            </div>
          </form>
        ) : (
          /* ======================================= */
          /* INLINE FORGOT PASSWORD VIEW MODE        */
          /* ======================================= */
          <form className="auth-surface-card" onSubmit={handleForgotPasswordSubmit}>
            <div className="auth-card-header">
              <button 
                type="button" 
                className="forgot-back-trigger"
                onClick={() => switchMode("LOGIN")}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--text-muted, #94a3b8)', cursor: 'pointer', marginBottom: '1rem', fontSize: '0.9rem' }}
              >
                <FaArrowLeft /> Back to Login
              </button>
              <h2>Reset Password</h2>
              <p>Enter your verified email to receive secondary account access keys</p>
            </div>

            <div className="auth-input-group" style={{ marginTop: '1.5rem' }}>
              <label htmlFor="forgotEmail">Registered Email Address</label>
              <div className="interactive-input-wrapper">
                <MdEmail className="input-field-icon" />
                <input
                  id="forgotEmail"
                  type="email"
                  placeholder="name@gmail.com"
                  value={forgotEmail}
                  onChange={(e) => {
                    setForgotEmail(e.target.value);
                    if (errorMsg) setErrorMsg("");
                    if (successMsg) setSuccessMsg("");
                  }}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {errorMsg && <div className="status-error-box" role="alert" style={{ marginTop: '1rem' }}>{errorMsg}</div>}
            {successMsg && <div className="status-success-box" role="alert" style={{ marginTop: '1rem' }}>{successMsg}</div>}

            <button type="submit" className="action-submit-btn" style={{ marginTop: '1.5rem' }} disabled={isLoading}>
              {isLoading ? "Sending Recovery Link..." : "Send Reset Link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}