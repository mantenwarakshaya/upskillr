import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './components/AuthProvider'; // Make sure path is correct
import { ProtectedRoute } from './ProtectedRoute'; // Make sure path is correct

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
import JobAnalyzer from "./components/AI/JobAnalysis"; 
import InterviewAnalysis from "./components/AI/InterviewAnalysis";

// Optional: Prevent logged-in users from visiting Login/Signup/Landing
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ACCESS CHANNELS (Redirects to /dashboard if already logged in) */}
        <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Signin /></PublicRoute>} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        
        {/* SECURE LAYOUT SUB-SYSTEM */}
        {/* Wrapping the entire layout route secures everything inside it */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/gap-analysis" element={<GapAnalysis />} />
          <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
          <Route path="/mock-interview" element={<InterviewAnalysis />} />
          <Route path="/job-match" element={<JobAnalyzer />} />
          
          <Route path="/profile" element={<ShowProfile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
        </Route>

        {/* Fallback for unmatched routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;