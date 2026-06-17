import { Link } from "react-router-dom";
import {
  ArrowRight,
  Briefcase,
  FileText,
  MessageSquare,
  Target,
} from "lucide-react";
import Navbar from "../Navbar";
import "./index.css";

const features = [
  {
    id: "resume",
    icon: FileText,
    title: "Resume Analyzer",
    description:
      "Extract skills, spot missing keywords, and surface improvement signals directly from your resume.",
  },
  {
    id: "gap",
    icon: Target,
    title: "AI Skill Gap Roadmaps",
    description:
      "Compare your stack with your target role and get a structured, prioritized learning path built for you.",
    highlighted: true,
  },
  {
    id: "mock",
    icon: MessageSquare,
    title: "Mock Interviews",
    description:
      "Practice technical, behavioral, and DSA interviews with focused feedback on clarity and depth.",
  },
  {
    id: "jobs",
    icon: Briefcase,
    title: "Smart Job Match",
    description:
      "Find roles matched to your current readiness — with a fit score for each listing.",
  },
];

const trustItems = [
  "No credit card",
  "Ready in 2 minutes",
  "Cancel anytime",
];

export default function Landing() {
  return (
    <>
      <Navbar />
      <div className="landing">

        {/* HERO SECTION */}
        <section id="home" className="hero-section">
          <div className="hero-left">
            <span className="hero-badge">
              <span className="badge-dot" />
              AI career intelligence for developers
            </span>

            <h1>
              Know exactly <span>what to learn</span> for your next role.
            </h1>

            <p className="hero-description">
              Upskillr maps your profile, resume, and target role into a ranked
              learning plan — so you close the gap faster and land with
              confidence.
            </p>

            <div className="hero-buttons">
              <Link to="/signup" className="primary-btn">
                Start for free <ArrowRight size={16} />
              </Link>

              <a href="#how-it-works" className="secondary-btn">
                How it works
              </a>
            </div>

            <div className="trust-line">
              {trustItems.map((item) => (
                <div key={item} className="trust-item">
                  <span className="trust-check">✓</span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* HERO GRAPHIC / DASHBOARD CARD */}
          <div className="readiness-card">
            <div className="card-header">
              <span className="card-title">Role Readiness</span>
              <span className="role-badge">Full Stack Developer</span>
            </div>

            <div className="score-card">
              <div className="score-main">
                <div className="score">
                  72<span>%</span>
                </div>
                <div className="score-meta">
                  <h4>Ready for target role</h4>
                  <p>Based on your current profile</p>
                </div>
              </div>
              <RingProgress value={72} />
            </div>

            <div className="skill-list">
              <SkillBar
                label="React"
                value={86}
                badge="Strong"
                color="var(--success)"
              />

              <SkillBar
                label="Node.js"
                value={74}
                badge="Good"
                color="var(--primary)"
              />

              <SkillBar
                label="System Design"
                value={48}
                badge="Gap"
                color="var(--warning)"
              />
            </div>

            <div className="roadmap-box">
              <span>3 skills to close the gap →</span>
              <span className="action-text">View roadmap</span>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section id="features" className="section">
          <div className="section-header">
            <div className="eyebrow">Features</div>
            <h2>Everything connected to your career profile.</h2>
          </div>

          <div className="features-grid">
            {features.map(
              ({ id, icon: Icon, title, description, highlighted }) => (
                <article
                  key={id}
                  className={`feature-card ${
                    highlighted ? "highlighted" : ""
                  }`}
                >
                  <div className="feature-card-header">
                    <div className="feature-icon">
                      <Icon size={20} />
                    </div>
                    {highlighted && (
                      <span className="popular-badge">
                        Popular
                      </span>
                    )}
                  </div>

                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              )
            )}
          </div>
        </section>

        {/* WORKFLOW SECTION */}
        <section id="how-it-works" className="section alt-bg">
          <div className="section-header">
            <div className="eyebrow">Workflow</div>
            <h2>From scattered skills to a clear plan — in three steps.</h2>
          </div>

          <div className="steps-grid">
            <StepCard
              number="01"
              title="Build your profile"
              text="Add your target role, current skills, GitHub, and paste in your resume."
            />

            <StepCard
              number="02"
              title="See your gaps"
              text="Upskillr compares your profile against real role expectations."
            />

            <StepCard
              number="03"
              title="Follow the roadmap"
              text="Work through prioritized skills, mock interviews and job matches."
            />
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="cta-section">
          <div className="cta-content">
            <div className="eyebrow inverted">Get Started</div>
            <h2>Your next role starts with knowing the gap.</h2>
            <p>
              Join thousands of developers who closed their skill gap
              with Upskillr.
            </p>

            <div className="hero-buttons centered">
              <Link to="/signup" className="primary-btn light">
                Start for free
              </Link>
              <a href="#features" className="secondary-btn inverted">
                Explore features
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function RingProgress({ value }) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="ring-progress">
      <svg viewBox="0 0 56 56">
        <circle
          cx="28"
          cy="28"
          r={radius}
          className="ring-bg"
        />
        <circle
          cx="28"
          cy="28"
          r={radius}
          className="ring-fill"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="ring-text">{value}%</span>
    </div>
  );
}

function SkillBar({ label, value, color, badge }) {
  return (
    <div className="skill-bar">
      <div className="skill-header">
        <span className="skill-label">{label}</span>
        <div className="skill-meta">
          <span className="skill-badge" style={{ color: color, backgroundColor: `${color}15` }}>
            {badge}
          </span>
          <span className="skill-percentage">{value}%</span>
        </div>
      </div>

      <div className="progress-bg">
        <div
          className="progress-fill"
          style={{
            width: `${value}%`,
            background: color,
          }}
        />
      </div>
    </div>
  );
}

function StepCard({ number, title, text }) {
  return (
    <article className="step-card">
      <div className="step-card-header">
        <span className="step-number">{number}</span>
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}