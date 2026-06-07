import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './components/pages/Landing';
import Signup from './components/pages/Signup';
import Signin from './components/pages/Login';
import VerifyEmail from './components/pages/VerifyEmail';

import Dashboard from './components/Dashboard';
import ShowProfile from './components/Profile/ShowProfile';
import EditProfile from './components/Profile/EditProfile';
import AppLayout from './AppLayout';

import GapAnalysis from "./components/AI/GapAnalysis";
import ResumeAnalyzer from "./components/AI/ResumeAnalyzer";
// FIX: Import the actual component from your JobAnalysis folder (Webpack/Vite automatically resolves index.jsx)
import JobAnalyzer from "./components/AI/JobAnalysis"; 

// Base inline fallback component to verify route changes without crashing
const Placeholder = ({ name }) => (
  <div style={{ width: "100%" }}>
    <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem" }}>
      {name}
    </h1>
    <p style={{ color: "#64748b", fontSize: "1rem" }}>
      This workspace view will dynamically swap when you click the sidebar menu links!
    </p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ACCESS CHANNELS */}
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Signin />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        
        {/* SECURE LAYOUT SUB-SYSTEM */}
        {/* The Sidebar remains static here while the internal routes swap cleanly */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/gap-analysis" element={<GapAnalysis />} />
          <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
          <Route path="/roadmaps" element={<Placeholder name="Personalized Roadmaps" />} />
          <Route path="/mock-interview" element={<Placeholder name="Mock Interview System" />} />
          
          {/* FIX: Replaced the placeholder element with your real JobAnalyzer component */}
          <Route path="/job-match" element={<JobAnalyzer />} />
          
          <Route path="/profile" element={<ShowProfile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;