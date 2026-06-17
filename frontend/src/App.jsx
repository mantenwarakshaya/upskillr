import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import axios from "axios";

import Landing from "./components/pages/Landing";
import Login from "./components/pages/Login";
import Signup from "./components/pages/Signup";

import AppLayout from "./AppLayout";
import Dashboard from "./components/Home/Dashboard";
import EditProfile from "./components/Profile/EditProfile";
import Profile from "./components/Profile/ShowProfile"; // Standardized name matching export
import ResumeAnalyzer from "./components/AI/ResumeAnalysis";
import GapAnalysis from "./components/AI/GapAnalysis";
import JobMatch from "./components/AI/JobAnalysis";
import NotFound from "./components/NotFound";

import { LoaderView, ErrorView } from "./components/Common";

// Unified environment lookup variable targeting consistency
const API_BASE_URL = import.meta.env?.VITE_API_URL || "http://localhost:7777";

export default function App() {
  const [authState, setAuthState] = useState({
    loading: true,
    user: null,
    error: "",
  });

  const checkSession = async () => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: "" }));

      const response = await axios.get(`${API_BASE_URL}/api/me`, {
        withCredentials: true,
      });

      setAuthState({
        loading: false,
        user: response.data?.user || null,
        error: "",
      });
    } catch {
      setAuthState({
        loading: false,
        user: null,
        error: "",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/logout`, {}, {
        withCredentials: true,
      });
    } catch (err) {
      console.error("Logout request failure:", err);
    } finally {
      setAuthState({
        loading: false,
        user: null,
        error: "",
      });
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  if (authState.loading) {
    return <LoaderView message="Opening your workspace..." />;
  }

  if (authState.error) {
    return <ErrorView title="Could not load application" message={authState.error} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={authState.user ? <Navigate to="/dashboard" replace /> : <Landing />} />
        <Route path="/login" element={authState.user ? <Navigate to="/dashboard" replace /> : <Login onLoginSuccess={checkSession} />} />
        <Route path="/signup" element={authState.user ? <Navigate to="/dashboard" replace /> : <Signup />} />

        <Route element={authState.user ? <AppLayout user={authState.user} onLogout={handleLogout} /> : <Navigate to="/" replace />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
          <Route path="/gap-analysis" element={<GapAnalysis />} />
          <Route path="/job-match" element={<JobMatch />} /> 

          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}