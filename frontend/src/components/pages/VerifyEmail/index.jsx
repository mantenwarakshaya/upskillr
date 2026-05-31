import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import logo from "../../../assets/nav_logo.png";
import "./index.css";

// Kept localhost as requested
const API_BASE_URL = "http://localhost:7777";

export default function VerifyEmail() {
  const { token } = useParams();

  const [status, setStatus] = useState("LOADING");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/verify-email/${token}`
        );

        setStatus("SUCCESS");
        
        setMessage(
          typeof res.data === "string" 
            ? res.data 
            : res.data?.message || "Email verified successfully. You can now login."
        );
      } catch (err) {
        setStatus("FAILURE");
        setMessage(
          err.response?.data?.message || err.response?.data || "Something went wrong"
        );
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token]);

  return (
    <div className="ve-main">
      <div className="ve-card">
        <img src={logo} alt="UpSkillr" className="ve-logo" />

        {status === "LOADING" && (
          <>
            <h2 className="ve-title">Verifying your email...</h2>
            <p className="ve-subtitle">Please wait a moment</p>
          </>
        )}

        {status === "SUCCESS" && (
          <>
            <h2 className="ve-title success">Email verified</h2>
            <p className="ve-subtitle">{message}</p>

            <Link to="/login" className="ve-btn">
              Go to Login
            </Link>
          </>
        )}

        {status === "FAILURE" && (
          <>
            <h2 className="ve-title error">Verification failed</h2>
            <p className="ve-subtitle">{message}</p>

            <Link to="/signup" className="ve-link">
              Create a new account
            </Link>
          </>
        )}
      </div>
    </div>
  );
}