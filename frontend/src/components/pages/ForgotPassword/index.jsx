import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

import { FaArrowLeft } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import logo from "../../../assets/nav_logo.png";
import "./index.css";

// Seamless environmental configurations fallback matching your Upskillr ecosystem
const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || "http://localhost:7777";

export default function ForgotPassword() {
  const [emailId, setEmailId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/forgot-password`, 
        { emailId }
      );
      
      // Axios processes clean texts or fallback object messages automatically
      setSuccessMsg(response.data?.message || response.data || "📩 Recovery link sent successfully! Check your inbox.");
      setEmailId(""); // Wipe input upon successful resolution
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || err.response?.data || "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
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
        <form className="auth-surface-card" onSubmit={handleSubmit}>
          <div className="auth-card-header">
            <Link 
              to="/login" 
              className="context-action-link"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem', textDecoration: 'none' }}
            >
              <FaArrowLeft /> Back to Login
            </Link>
            <h2>Forgot your password?</h2>
            <p>Enter your registered email and we’ll send you a recovery link.</p>
          </div>

          {/* EMAIL INPUT GROUP */}
          <div className="auth-input-group" style={{ marginTop: '1.5rem' }}>
            <label htmlFor="emailId">Email Address</label>
            <div className="interactive-input-wrapper">
              <MdEmail className="input-field-icon" />
              <input
                id="emailId"
                type="email"
                placeholder="name@gmail.com"
                value={emailId}
                onChange={(e) => {
                  setEmailId(e.target.value);
                  if (errorMsg) setErrorMsg("");
                  if (successMsg) setSuccessMsg("");
                }}
                disabled={isLoading}
                required
              />
            </div>
          </div>

          {/* SYSTEM MESSAGES */}
          {errorMsg && (
            <div className="status-error-box" role="alert" style={{ marginTop: '1.25rem' }}>
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="status-success-box" role="alert" style={{ marginTop: '1.25rem' }}>
              {successMsg}
            </div>
          )}

          {/* SUBMIT TRIGGER */}
          <button 
            type="submit" 
            className="action-submit-btn" 
            style={{ marginTop: '1.5rem' }} 
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
}