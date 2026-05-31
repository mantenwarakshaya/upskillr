import { Link } from "react-router-dom";
import logo from "../../../assets/nav_logo.png";
import './index.css';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="nav-brand">
          <img src={logo} alt="UpSkillr Logo" className="nav-logo-img" />
        </Link>
      </div>

      <div className="nav-center">
        <Link to="/">Home</Link>
        {/* Changed to anchor tags so they smoothly scroll to sections on the landing page */}
        <a href="#features">Features</a>
        <a href="#how-it-works">About</a>
      </div>

      <div className="nav-actions">
        <Link to="/login" className="nav-login">
          Login
        </Link>
        <Link to="/signup" className="nav-signup">
          Get Started
        </Link>
      </div>
    </nav>
  );
}