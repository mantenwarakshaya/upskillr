import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  FaCalendarAlt,
  FaEdit,
  FaEnvelope,
  FaGithub,
  FaUserGraduate,
  FaFileAlt
} from "react-icons/fa";
import { LoaderView, ErrorView, EmptyView } from "../../../components/Common";
import "./index.css";

const API_BASE_URL = import.meta.env?.VITE_API_URL || "http://localhost:7777";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const getProfile = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const response = await axios.get(`${API_BASE_URL}/api/me`, {
        withCredentials: true
      });

      setUser(response.data?.user || null);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Could not retrieve your profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  if (loading) return <LoaderView message="Loading profile..." />;
  if (errorMsg) return <ErrorView message={errorMsg} onRetry={getProfile} />;
  if (!user) {
    return (
      <EmptyView
        title="No profile found"
        message="Your profile data is not available right now."
      />
    );
  }

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric"
      })
    : "Not available";

  return (
    <main className="p-profile-workspace">
      <div className="p-profile-shell">
        <section className="p-profile-card">
          <header className="p-profile-header">
            <div className="p-identity-group">
              <div className="p-avatar-initial">
                {user?.firstName?.charAt(0)?.toUpperCase() || "U"}
              </div>

              <div className="p-identity-copy">
                <h1>
                  {user?.firstName} {user?.lastName || ""}
                </h1>

                <p className="p-email-line">
                  <FaEnvelope />
                  <span>{user?.emailId}</span>
                </p>

                <span className="p-role-badge">
                  <FaUserGraduate />
                  {user?.targetRole || "Target role not set"}
                </span>
              </div>
            </div>

            <Link to="/profile/edit" className="p-primary-btn">
              <FaEdit />
              <span>Edit Profile</span>
            </Link>
          </header>

          <section className="p-overview-section" aria-label="Profile overview">
            <div className="p-section-header">
              <h2>Profile Overview</h2>
            </div>

            <div className="p-metric-grid">
              <MetricCard label="Target Role" value={user?.targetRole || "Not configured"} />
              <MetricCard
                label="Joined On"
                value={
                  <span className="p-inline-value">
                    <FaCalendarAlt />
                    {joinedDate}
                  </span>
                }
              />
            </div>
          </section>

          <section className="p-assets-grid" aria-label="Connected profile links">
            <AssetBox
              title="GitHub Portfolio"
              description="Keep your GitHub connected so your profile reflects your project work."
              href={user?.github}
              icon={<FaGithub />}
              action="Open GitHub"
              empty="GitHub link has not been added yet."
            />

            <AssetBox
              title="Resume Analysis"
              description="Upload or review your latest resume analysis from the resume workspace."
              href="/resume-analyzer"
              icon={<FaFileAlt />}
              action="Open Resume Analyzer"
              internal
            />
          </section>
        </section>
      </div>
    </main>
  );
}

function MetricCard({ label, value }) {
  return (
    <article className="p-metric-card">
      <span className="p-metric-label">{label}</span>
      <div className="p-metric-value">{value}</div>
    </article>
  );
}

function AssetBox({ title, description, href, icon, action, empty, internal = false }) {
  const content = (
    <>
      {icon}
      <span>{action}</span>
    </>
  );

  return (
    <article className="p-asset-card">
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>

      {href ? (
        internal ? (
          <Link to={href} className="p-secondary-btn">
            {content}
          </Link>
        ) : (
          <a href={href} target="_blank" rel="noreferrer" className="p-secondary-btn">
            {content}
          </a>
        )
      ) : (
        <div className="p-empty-state">{empty}</div>
      )}
    </article>
  );
}