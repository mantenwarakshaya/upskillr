import { Link } from 'react-router-dom';
import { Target, FileText, Map, MessageSquare, Briefcase } from 'lucide-react';
import Navbar from '../Navbar';
import './index.css';

export const FEATURES = [
  {
    id: 'gap-analysis',
    icon: <Target className="feature-icon" />,
    title: 'AI Skill Gap Analysis',
    description: 'The core engine. Compares your current technical stack directly against target roles. Get instant match percentages, identified missing technologies, and a priority sequence for what to learn first.',
    isHighlighted: true
  },
  {
    id: 'resume-analyzer',
    icon: <FileText className="feature-icon" />,
    title: 'Resume Analyzer',
    description: 'Upload your resume PDF to extract detailed skill metrics. Receive actionable tracking scores, critical keyword improvements, and industry alignment feedback powered by deep LLM parsing.',
    isHighlighted: false
  },
  {
    id: 'roadmaps',
    icon: <Map className="feature-icon" />,
    title: 'Personalized Roadmaps',
    description: 'Accelerate your growth with custom daily and weekly structured schedules. Broken down by topic order and clear estimated time-to-completion metrics so you never waste a day.',
    isHighlighted: false
  },
  {
    id: 'mock-interviews',
    icon: <MessageSquare className="feature-icon" />,
    title: 'Mock Interview System',
    description: 'Practice with an AI interviewer covering Technical, HR, and Data Structures & Algorithms. Get precise, constructive response evaluations along with clarity benchmarks.',
    isHighlighted: false
  },
  {
    id: 'job-match',
    icon: <Briefcase className="feature-icon" />,
    title: 'Smart Job Match',
    description: 'Skip the endless job board browsing. Our engine uses real-time search vectors to pull highly compatible roles directly from major industry ecosystems tailored to your fresh skills.',
    isHighlighted: false
  }
];

export default function Landing() {
  return (
    <div className="landing-page-container">
      <Navbar />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="badge-pill">AI-Powered Career Intelligence</div>
        <h1 className="hero-title">Bridge the Gap to Your Dream Role.</h1>
        <p className="hero-subtitle">Don't guess what skills you need. Our AI analyzes your experience and engineering profile against real industry benchmarks to build your perfect career roadmap.</p>
        <div className="cta-group">
          <Link to="/signup" className="btn-primary">Get Started Free</Link>
          <a href="#how-it-works" className="btn-secondary">See How It Works</a>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works-section">
        <h2 className="section-title">Your Path to Success in 3 Steps</h2>
        <div className="steps-container">
          <div className="step-card">
            <div className="step-number">01</div>
            <h3>Upload & Select</h3>
            <p>Parse your current resume and pick your target dream role.</p>
          </div>
          <div className="step-card">
            <div className="step-number">02</div>
            <h3>AI Analysis</h3>
            <p>Our intelligence engine maps out your exact skill and experience gaps.</p>
          </div>
          <div className="step-card">
            <div className="step-number">03</div>
            <h3>Upskill & Match</h3>
            <p>Follow a customized, structured roadmap and match with live jobs.</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <h2 className="section-title">Core Career Intelligence Features</h2>
        <div className="features-grid">
          {FEATURES.map((feature) => (
            <div 
              key={feature.id} 
              className={`feature-card ${feature.isHighlighted ? 'highlight-card' : ''}`}
            >
              <div className="card-icon-container">
                {feature.icon}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>Upskillr</h3>
            <p>Empowering developers to bridge the gap between potential and reality.</p>
          </div>
          <div className="footer-links">
            <h4>Product</h4>
            <a href="#features">Features</a>
            <a href="/pricing">Pricing</a>
          </div>
          <div className="footer-links">
            <h4>Company</h4>
            <a href="/about">About Us</a>
            <a href="/contact">Contact</a>
          </div>
          <div className="footer-links">
            <h4>Legal</h4>
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Upskillr Inc. All Rights Reserved.</p>
          <p className="crafted-by">Crafted by Mantenwar Akshaya</p>
        </div>
      </footer>
    </div>
  );
}