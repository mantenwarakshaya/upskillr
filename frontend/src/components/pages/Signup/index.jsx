import { useState } from "react";
import { Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { MdEmail, MdLock, MdPerson, MdWork } from "react-icons/md";
import logo from "../../../assets/nav_logo.png";
import axios from "axios";
import "./index.css";

const API_BASE_URL = "http://localhost:7777";

export default function Signup() {
  const [formData, setFormData] = useState({
    firstName: "",
    emailId: "",
    password: "",
    targetRole: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    if (errorMsg) setErrorMsg("");
    if (successMsg) setSuccessMsg("");
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await axios.post(`${API_BASE_URL}/api/signup`, formData, {
        withCredentials: true,
      });

      setIsEmailSent(true);
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || "Signup failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!formData.emailId) {
      setErrorMsg("Email address is missing.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await axios.post(`${API_BASE_URL}/api/resend-verification`, {
        emailId: formData.emailId,
      });

      setSuccessMsg("Verification email sent again successfully!");
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || "Could not resend email. Try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-viewport">
      <div className="signup-aside-brand">
        <div className="radial-overlay"></div>

        <div className="aside-content">
          <img src={logo} alt="Upskillr" className="brand-logo-img" />

          <div className="hero-status-badge">AI Career Growth Platform</div>

          <h1 className="aside-heading">
            Start Building Your
            <span> Dream Career</span>
          </h1>

          <p className="aside-desc">
            Join Upskillr and unlock personalized AI-powered career analysis,
            skill gap insights, resume optimization, and smart learning
            roadmaps.
          </p>

          <div className="signup-features-pills">
            <div className="feature-glass-pill">AI Skill Gap Analysis</div>
            <div className="feature-glass-pill">Resume Analyzer</div>
            <div className="feature-glass-pill">Personalized Roadmaps</div>
            <div className="feature-glass-pill">Mock Interview System</div>
            <div className="feature-glass-pill">Smart Job Matches</div>
          </div>
        </div>
      </div>

      <div className="signup-main-auth">
        {isEmailSent ? (
          <div className="auth-surface-card" style={{ textAlign: "center" }}>
            <div className="auth-card-header">
              <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>
                📩
              </div>

              <h2>Verify your email</h2>

              <p>We've sent an activation link to your inbox:</p>

              <strong
                style={{
                  display: "block",
                  margin: "0.75rem 0",
                  color: "var(--primary-color, #3b82f6)",
                  fontSize: "1.1rem",
                  wordBreak: "break-word",
                }}
              >
                {formData.emailId}
              </strong>

              <p style={{ fontSize: "0.9rem", opacity: 0.8 }}>
                Please check your inbox and click the link to activate your
                account.
              </p>
            </div>

            <button
              type="button"
              className="action-submit-btn"
              style={{ marginTop: "1.5rem" }}
              onClick={handleResendEmail}
              disabled={isLoading}
            >
              {isLoading ? "Sending Link..." : "Resend Email"}
            </button>

            {successMsg && (
              <div
                className="status-success-box"
                role="status"
                style={{ marginTop: "1rem" }}
              >
                {successMsg}
              </div>
            )}

            {errorMsg && (
              <div
                className="status-error-box"
                role="alert"
                style={{ marginTop: "1rem" }}
              >
                {errorMsg}
              </div>
            )}

            <p style={{ marginTop: "1rem", fontSize: "0.9rem", opacity: 0.8 }}>
              Didn't receive the email? Check your spam folder.
            </p>

            <div className="switch-auth-context" style={{ marginTop: "2rem" }}>
              Already activated?{" "}
              <Link to="/login" className="context-action-link">
                Sign In
              </Link>
            </div>
          </div>
        ) : (
          <form className="auth-surface-card" onSubmit={handleSignup}>
            <div className="auth-card-header">
              <h2>Create Account</h2>
              <p>Begin your AI-powered upskilling journey</p>
            </div>

            <div className="auth-input-group">
              <label htmlFor="firstName">Full Name</label>

              <div className="interactive-input-wrapper">
                <MdPerson className="input-field-icon" />

                <input
                  id="firstName"
                  type="text"
                  name="firstName"
                  placeholder="John Doe"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>
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
                  disabled={isLoading}
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
                  disabled={isLoading}
                  required
                />

                <button
                  type="button"
                  className="password-toggle-trigger"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={isLoading}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="auth-input-group">
              <label htmlFor="targetRole">Target Role</label>

              <div className="interactive-input-wrapper">
                <MdWork className="input-field-icon" />

                <select
                  id="targetRole"
                  name="targetRole"
                  value={formData.targetRole}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                >
                  <option value="">Select Target Role</option>

                  <optgroup label="Software Engineering">
                    <option value="Frontend Developer">
                      Frontend Developer
                    </option>
                    <option value="Backend Developer">Backend Developer</option>
                    <option value="Full Stack Developer">
                      Full Stack Developer
                    </option>
                    <option value="MERN Developer">MERN Developer</option>
                    <option value="Mobile Application Developer">
                      Mobile Application Developer
                    </option>
                  </optgroup>

                  <optgroup label="Data & Infrastructure">
                    <option value="AI Engineer">AI Engineer</option>
                    <option value="Machine Learning Engineer">
                      Machine Learning Engineer
                    </option>
                    <option value="Data Engineer">Data Engineer</option>
                    <option value="DevOps / Cloud Engineer">
                      DevOps / Cloud Engineer
                    </option>
                  </optgroup>

                  <optgroup label="Security & Quality">
                    <option value="Cybersecurity Engineer">
                      Cybersecurity Engineer
                    </option>
                    <option value="QA Automation Engineer">
                      QA Automation Engineer
                    </option>
                    <option value="UI/UX Engineer">UI/UX Engineer</option>
                  </optgroup>
                </select>
              </div>
            </div>

            {errorMsg && (
              <div className="status-error-box" role="alert">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              className="action-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? "Sending Verification..." : "Create Account"}
            </button>

            <div className="switch-auth-context">
              Already have an account?{" "}
              <Link to="/login" className="context-action-link">
                Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}