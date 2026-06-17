import { Link } from "react-router-dom";
import "./index.css";

export default function Navbar() {
  return (
    <nav className="navbar" aria-label="Main Navigation">
      {/* BRAND LOGO */}
      <Link to="/" className="navbar-logo" aria-label="Upskillr Home">
        <div className="navbar-logo-icon">U</div>
        <span className="navbar-logo-text">Upskillr</span>
      </Link>

      {/* DESKTOP NAVIGATION LINKS */}
      <div className="navbar-links">
        <a href="#home" className="nav-link">Home</a>
        <a href="#features" className="nav-link">Features</a>
        <a href="#how-it-works" className="nav-link">How it works</a>
      </div>

      {/* ACTION INTERFACES */}
      <div className="navbar-actions">
        <Link to="/login" className="navbar-login">
          Login
        </Link>
        <Link to="/signup" className="navbar-button">
          Get Started
        </Link>
      </div>
    </nav>
  );
}