import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Workflow,
} from "lucide-react";
import { useAuth } from "../../../AuthProvider";
import "./index.css";

const API_BASE_URL =
  import.meta.env?.VITE_API_URL || "http://localhost:7777";

const roles = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "MERN Developer",
  "Mobile Application Developer",
  "AI Engineer",
  "Machine Learning Engineer",
  "Data Engineer",
  "DevOps / Cloud Engineer",
  "Cybersecurity Engineer",
  "QA Automation Engineer",
  "UI/UX Engineer",
];

export default function Signup() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [formData, setFormData] = useState({
    firstName: "",
    emailId: "",
    password: "",
    targetRole: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    setErrorMsg("");
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    setErrorMsg("");

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/signup`,
        formData,
        {
          withCredentials: true,
        }
      );

      if (response.data?.user) {
        setUser(response.data.user);

        navigate("/dashboard", {
          replace: true,
        });

        return;
      }

      navigate("/login", {
        replace: true,
        state: {
          message: "Account created successfully. Please sign in.",
        },
      });
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || "Signup failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-page">
      {/* LEFT SIDEBAR PANEL */}
      <aside className="signup-left">
        <div className="signup-left-content">
          <span className="signup-tag">Upskillr Workspace</span>
          <h1>Build a career profile that actually guides you.</h1>
          <p>
            Resume analysis, role readiness, mock interviews, and smart job
            matches in one focused developer workspace.
          </p>
        </div>
        <div className="signup-left-bg-glow" />
      </aside>

      {/* RIGHT AUTH CARD FORM PANEL */}
      <main className="signup-right">
        <div className="signup-card-container">
          <form onSubmit={handleSignup} className="signup-card">
            <div className="signup-header">
              <div className="logo-circle">U</div>

              <div className="signup-header-content">
                <h2>Create Account</h2>
                <p>
                  Start with your target role. You can add skills, GitHub,
                  and resume later.
                </p>
              </div>
            </div>

            {/* ERROR NOTIFICATION SYSTEM */}
            {errorMsg && <div className="auth-alert error-box">{errorMsg}</div>}

            {/* INPUT FIELDS CONTAINER */}
            <div className="form-fields">
              <Field
                id="firstName"
                icon={<User size={18} className="input-icon" />}
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Akshaya"
                disabled={isLoading}
                autoComplete="given-name"
                required
              />

              <Field
                id="emailId"
                icon={<Mail size={18} className="input-icon" />}
                label="Email Address"
                name="emailId"
                type="email"
                value={formData.emailId}
                onChange={handleChange}
                placeholder="name@company.com"
                disabled={isLoading}
                autoComplete="email"
                required
              />

              {/* PASSWORD */}
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-box">
                  <Lock size={18} className="input-icon" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 8 characters"
                    disabled={isLoading}
                    autoComplete="new-password"
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

              {/* TARGET ROLE SELECT */}
              <div className="form-group">
                <label htmlFor="targetRole">Target Role</label>
                <div className="input-box custom-select-box">
                  <Workflow size={18} className="input-icon" />
                  <select
                    id="targetRole"
                    name="targetRole"
                    value={formData.targetRole}
                    onChange={handleChange}
                    disabled={isLoading}
                    required
                  >
                    <option value="" disabled hidden>
                      Select your role
                    </option>
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* SIGNUP SUBMIT BUTTON */}
            <button type="submit" className="signup-btn" disabled={isLoading}>
              {isLoading ? (
                <span className="btn-spinner-content">
                  <span className="spinner-dot" /> Creating Workspace...
                </span>
              ) : (
                "Create Account"
              )}
            </button>

            <p className="signin-text">
              Already have an account? <Link to="/login">Sign In</Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}

function Field({ icon, label, id, name, ...props }) {
  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <div className="input-box">
        {icon}
        <input id={id} name={name} {...props} />
      </div>
    </div>
  );
}