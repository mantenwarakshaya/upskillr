import { Link } from "react-router-dom";
import {
  ArrowRight,
  Briefcase,
  FileText,
  MessageSquare,
  Target,
  GitBranch,
  Zap,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import Navbar from "../Navbar";
import "./index.css";

const features = [
  {
    id: "resume",
    icon: FileText,
    title: "Resume Analyzer",
    description:
      "Extract skills, surface missing keywords, and get actionable improvement signals directly from your resume.",
    stat: "2 min",
    statLabel: "avg. analysis time",
  },
  {
    id: "gap",
    icon: Target,
    title: "AI Skill Gap Roadmaps",
    description:
      "Compare your stack with your target role and receive a prioritized, structured learning path built for you.",
    stat: "94%",
    statLabel: "reported clarity",
    highlighted: true,
  },
  {
    id: "mock",
    icon: MessageSquare,
    title: "Mock Interviews",
    description:
      "Practice technical, behavioral, and DSA interviews with focused feedback on clarity and depth.",
    stat: "50+",
    statLabel: "question types",
  },
  {
    id: "jobs",
    icon: Briefcase,
    title: "Smart Job Match",
    description:
      "Find roles matched to your current readiness — with a fit score and gap delta for each listing.",
    stat: "1.2k+",
    statLabel: "roles indexed",
  },
];

const steps = [
  {
    number: "01",
    title: "Build your profile",
    text: "Add your target role, current skills, GitHub links, and paste in your resume.",
    icon: GitBranch,
  },
  {
    number: "02",
    title: "See your gaps",
    text: "Upskillr compares your profile against real role expectations and scores your readiness.",
    icon: Zap,
  },
  {
    number: "03",
    title: "Follow the roadmap",
    text: "Work through prioritized skills, mock interviews, and job matches tailored to where you are.",
    icon: TrendingUp,
  },
];

const trustItems = ["No credit card", "Ready in 2 minutes", "Cancel anytime"];

const metrics = [
  { value: "12k+", label: "Developers" },
  { value: "94%", label: "Improved clarity" },
  { value: "3.2x", label: "Faster job prep" },
];

export default function Landing() {
  return (
    <>
      <Navbar />
      <div className="landing">

        {/* ── HERO ── */}
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-left">
              <span className="hero-badge">
                <span className="badge-dot" />
                AI career intelligence for developers
              </span>

              <h1>
                Know exactly{" "}
                <span className="hero-highlight">what to learn</span>{" "}
                for your next role.
              </h1>

              <p className="hero-description">
                Upskillr maps your profile, resume, and target role into a
                ranked learning plan — so you close the gap faster and land
                with confidence.
              </p>

              <div className="hero-actions">
                <Link to="/signup" className="btn btn-primary">
                  Start for free <ArrowRight size={15} />
                </Link>
                <a href="#how-it-works" className="btn btn-ghost">
                  How it works
                </a>
              </div>

              <div className="trust-row">
                {trustItems.map((item) => (
                  <span key={item} className="trust-item">
                    <span className="trust-check" aria-hidden="true">✓</span>
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* ── HERO CARD ── */}
            <div className="hero-card" aria-label="Role readiness preview">
              <div className="hcard-header">
                <div className="hcard-title-group">
                  <span className="hcard-eyebrow">Role Readiness</span>
                  <span className="hcard-role">Full Stack Developer</span>
                </div>
                <span className="hcard-live">
                  <span className="live-dot" aria-hidden="true" />
                  Live
                </span>
              </div>

              <div className="score-block">
                <div className="score-left">
                  <div className="score-value">
                    72<span className="score-unit">%</span>
                  </div>
                  <div className="score-labels">
                    <p className="score-title">Ready for target role</p>
                    <p className="score-sub">Based on your current profile</p>
                  </div>
                </div>
                <RingProgress value={72} />
              </div>

              <div className="skill-list">
                <SkillBar label="React"         value={86} badge="Strong" color="var(--clr-success)" />
                <SkillBar label="Node.js"       value={74} badge="Good"   color="var(--clr-primary)" />
                <SkillBar label="System Design" value={48} badge="Gap"    color="var(--clr-warning)" />
              </div>

              <div className="hcard-cta">
                <span className="hcard-cta-text">3 skills to close the gap</span>
                <button className="hcard-cta-link" type="button">
                  View roadmap <ChevronRight size={13} />
                </button>
              </div>
            </div>
          </div>

          {/* ── SOCIAL PROOF STRIP ── */}
          <div className="metrics-strip">
            {metrics.map(({ value, label }) => (
              <div key={label} className="metric-item">
                <span className="metric-value">{value}</span>
                <span className="metric-label">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section id="features" className="section">
          <header className="section-header">
            <div className="eyebrow">Features</div>
            <h2>Everything connected to your career profile.</h2>
            <p className="section-desc">
              One platform that links your resume, skills, interviews, and
              job search — so nothing falls through the cracks.
            </p>
          </header>

          <div className="features-grid">
            {features.map(({ id, icon: Icon, title, description, stat, statLabel, highlighted }) => (
              <article
                key={id}
                className={`feature-card${highlighted ? " feature-card--highlighted" : ""}`}
              >
                <div className="fc-top">
                  <div className="fc-icon" aria-hidden="true">
                    <Icon size={18} />
                  </div>
                  {highlighted && <span className="fc-badge">Most popular</span>}
                </div>

                <h3 className="fc-title">{title}</h3>
                <p className="fc-desc">{description}</p>

                <div className="fc-stat">
                  <span className="fc-stat-value">{stat}</span>
                  <span className="fc-stat-label">{statLabel}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section id="how-it-works" className="section section--alt">
          <header className="section-header">
            <div className="eyebrow">Workflow</div>
            <h2>From scattered skills to a clear plan.</h2>
            <p className="section-desc">
              Three focused steps that take you from "where am I?" to "here's what to do next."
            </p>
          </header>

          <div className="steps-grid">
            {steps.map(({ number, title, text, icon: Icon }) => (
              <StepCard key={number} number={number} title={title} text={text} Icon={Icon} />
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="cta-section">
          <div className="cta-inner">
            <div className="cta-badge">Get started</div>
            <h2 className="cta-heading">Your next role starts with knowing the gap.</h2>
            <p className="cta-body">
              Join thousands of developers who closed their skill gap with Upskillr.
            </p>
            <div className="cta-actions">
              <Link to="/signup" className="btn btn-cta-primary">
                Start for free <ArrowRight size={15} />
              </Link>
              <a href="#features" className="btn btn-cta-ghost">
                Explore features
              </a>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}

/* ── SUB-COMPONENTS ── */

function RingProgress({ value }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <div className="ring" role="img" aria-label={`${value}% readiness`}>
      <svg viewBox="0 0 56 56" aria-hidden="true">
        <circle cx="28" cy="28" r={r} className="ring-track" />
        <circle
          cx="28" cy="28" r={r}
          className="ring-fill"
          strokeDasharray={circ}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="ring-label">{value}%</span>
    </div>
  );
}

function SkillBar({ label, value, color, badge }) {
  return (
    <div className="skill-row">
      <div className="skill-meta">
        <span className="skill-name">{label}</span>
        <div className="skill-right">
          <span className="skill-badge" style={{ color, background: `${color}18` }}>
            {badge}
          </span>
          <span className="skill-pct">{value}%</span>
        </div>
      </div>
      <div className="skill-track">
        <div className="skill-fill" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}

function StepCard({ number, title, text, Icon }) {
  return (
    <article className="step-card">
      <div className="step-head">
        <span className="step-num">{number}</span>
        <span className="step-icon" aria-hidden="true">
          <Icon size={16} />
        </span>
      </div>
      <h3 className="step-title">{title}</h3>
      <p className="step-text">{text}</p>
    </article>
  );
}