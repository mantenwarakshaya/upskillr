import { useState } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useAuth } from "../../../AuthProvider";
import "./index.css";

const API_BASE_URL =
  import.meta.env?.VITE_API_BASE_URL || "http://localhost:7777";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();

  const [formData, setFormData] = useState({
    emailId: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] =
    useState(location.state?.message || "");
  const [isLoading, setIsLoading] = useState(false);
  const [showRestore, setShowRestore] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    setErrorMsg("");
    setShowRestore(false);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/login`,
        formData,
        {
          withCredentials: true,
        }
      );

      if (response.data?.user) {
        setUser(response.data.user);
      }

      navigate("/dashboard", {
        replace: true,
      });
    } catch (err) {
      const errorData = err.response?.data;

      if (errorData?.code === "ACCOUNT_DEACTIVATED") {
        setShowRestore(true);
        setErrorMsg(errorData.message);
      } else {
        setFormData((prev) => ({
          ...prev,
          password: "",
        }));

        setErrorMsg(
          errorData?.message ||
            "Invalid email or password. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreAccount = async () => {
    if (!formData.emailId || !formData.password) {
      setErrorMsg(
        "Enter your email and password to restore the account."
      );
      return;
    }

    setIsRestoring(true);
    setErrorMsg("");

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/restore-account`,
        formData
      );

      setShowRestore(false);

      setSuccessMsg(
        response.data?.message ||
          "Account restored. You can sign in now."
      );
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message ||
          "Account restoration failed. Please try again."
      );
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="login-page">
      {/* LEFT SIDEBAR PANEL */}
      <aside className="login-left">
        <div className="login-left-content">
          <span className="login-tag">AI Career Intelligence</span>
          <h1>Pick up your roadmap where you left off.</h1>
          <p>
            Review role readiness, improve weak areas, and keep your profile
            aligned with your target role.
          </p>
        </div>
        <div className="login-left-bg-glow" />
      </aside>

      {/* RIGHT AUTH CARD FORM PANEL */}
      <main className="login-right">
        <div className="login-card-container">
          <form onSubmit={handleLogin} className="login-card">
            <div className="login-header">
              <div className="logo-circle">U</div>
              <div>
                <h2>Welcome Back</h2>
                <p>Sign in to continue your Upskillr workspace.</p>
              </div>
            </div>

            {/* MESSAGES SYSTEM */}
            {errorMsg && <div className="auth-alert error-box">{errorMsg}</div>}
            {successMsg && <div className="auth-alert success-box">{successMsg}</div>}

            {/* ACCOUNT RESTORATION */}
            {showRestore && (
              <div className="restore-box">
                <div className="restore-header">
                  <span className="restore-dot" />
                  <strong>Account Deactivated</strong>
                </div>
                <p>You can restore it within the 7-day recovery window.</p>
                <button
                  type="button"
                  className="restore-btn"
                  onClick={handleRestoreAccount}
                  disabled={isRestoring}
                >
                  {isRestoring ? "Restoring Workspace..." : "Restore Account"}
                </button>
              </div>
            )}

            {/* INPUT FIELDS CONTAINER */}
            <div className="form-fields">
              {/* EMAIL */}
              <div className="form-group">
                <label htmlFor="emailId">Email Address</label>
                <div className="input-box">
                  <Mail size={18} className="input-icon" />
                  <input
                    id="emailId"
                    type="email"
                    name="emailId"
                    placeholder="name@company.com"
                    value={formData.emailId}
                    onChange={handleChange}
                    disabled={isLoading || isRestoring}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-box">
                  <Lock size={18} className="input-icon" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading || isRestoring}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {/* LOGIN SUBMIT BUTTON */}
            <button
              type="submit"
              className="login-btn"
              disabled={isLoading || isRestoring}
            >
              {isLoading ? (
                <span className="btn-spinner-content">
                  <span className="spinner-dot" /> Authenticating...
                </span>
              ) : (
                "Sign In"
              )}
            </button>

            <p className="signup-text">
              New to Upskillr? <Link to="/signup">Create account</Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}