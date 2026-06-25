import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  FaRocket,
  FaHistory,
  FaSpinner,
  FaCoins,
  FaMicrophone,
  FaClipboardCheck,
  FaChartLine,
} from "react-icons/fa";
import { LoaderView } from "../../Common";
import "./index.css";

const API_BASE_URL =
  import.meta.env?.VITE_API_URL || "http://localhost:7777";

export default function Interview({ user }) {
  const [history, setHistory] = useState([]);
  const [mode, setMode] = useState("landing");
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);

  const fetchHistory = useCallback(async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/interview/history`,
        { withCredentials: true }
      );

      setHistory(response.data?.interviews || []);
    } catch (err) {
      console.error(err);ƒ
    }
  }, []);

  const fetchInterviewReport = async (id) => {
    try {
      setReportLoading(true);

      const response = await axios.get(
        `${API_BASE_URL}/api/interview/${id}`,
        {
          withCredentials: true,
        }
      );

      setSelectedInterview(response.data.interview);
      setMode("report");
    } catch (err) {
      console.error(err);
      alert("Unable to load interview report");
    } finally {
      setReportLoading(false);
    }
  };

  const handleStart = async () => {
    setIsStarting(true);

    try {
      await axios.post(
        `${API_BASE_URL}/api/interview/start`,
        {
          role: user?.targetRole,
        },
        {
          withCredentials: true,
        }
      );

      await fetchHistory();
    } catch (err) {
      alert("Unable to start interview");
    } finally {
      setIsStarting(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchHistory();
      setIsLoading(false);
    };

    init();
  }, [fetchHistory]);

  if (isLoading)
    return (
      <LoaderView message="Preparing your interview environment..." />
    );

  const averageScore =
    history.length > 0
      ? (
          history.reduce(
            (acc, item) => acc + (item.feedback?.score || 0),
            0
          ) / history.length
        ).toFixed(1)
      : 0;

  return (
    <main className="i-viewport-workspace">
      <div className="i-grid-shell">

        {/* LANDING PAGE */}
        {mode === "landing" && (
          <>
            <section className="i-main-card">

              <div className="i-header-lockup">
                <span className="i-badge-accent">
                  AI Interview Simulator
                </span>

                <h1>Mock Interview</h1>

                <p>
                  Practice realistic AI-powered interviews
                  tailored to your target role and receive
                  detailed feedback.
                </p>
              </div>

              <div className="i-process-section">
                <h3>Interview Workflow</h3>

                <div className="i-process-step">
                  <div className="i-step-number">1</div>

                  <div>
                    <h4>Role Context</h4>
                    <p>
                      Generate questions based on your
                      target role.
                    </p>
                  </div>
                </div>

                <div className="i-process-step">
                  <div className="i-step-number">2</div>

                  <div>
                    <h4>AI Interview</h4>
                    <p>
                      Answer dynamic technical and
                      behavioral questions.
                    </p>
                  </div>
                </div>

                <div className="i-process-step">
                  <div className="i-step-number">3</div>

                  <div>
                    <h4>Performance Report</h4>
                    <p>
                      Receive score, strengths,
                      improvements, and recommendations.
                    </p>
                  </div>
                </div>
              </div>

              <div className="i-action-row">

                {history.length > 0 && (
                  <button
                    className="i-btn-secondary"
                    onClick={() => setMode("history")}
                  >
                    <FaHistory />
                    Previous Sessions
                  </button>
                )}

                <button
                  className="i-btn-primary"
                  onClick={handleStart}
                  disabled={isStarting}
                >
                  {isStarting ? (
                    <FaSpinner className="i-spin-engine" />
                  ) : (
                    <FaRocket />
                  )}

                  {isStarting
                    ? "Initializing..."
                    : "Start Interview"}
                </button>

              </div>
            </section>

            <aside className="i-sidebar-card">

              <h3>Interview Intelligence</h3>

              <div className="i-metric-card">
                <span>Credits Available</span>

                <strong>
                  {user?.aiUsage?.creditsRemaining || 0}
                </strong>
              </div>

              <div className="i-metric-card">
                <span>Total Sessions</span>

                <strong>{history.length}</strong>
              </div>

              <div className="i-metric-card">
                <span>AI Powered</span>

                <strong>Active</strong>
              </div>

            </aside>
          </>
        )}

        {/* HISTORY PAGE */}
        {mode === "history" && (
          <section className="i-full-width-card">

            <div className="i-page-header">

              <button
                className="i-btn-secondary"
                onClick={() => setMode("landing")}
              >
                ← Back
              </button>

              <h2>Interview History</h2>

            </div>

            {history.length > 0 ? (
              history.map((item) => (
                <div
                  key={item._id}
                  className="i-session-card"
                >
                  <div>

                    <h3>{item.role}</h3>

                    <p>
                      {new Date(
                        item.createdAt
                      ).toLocaleDateString()}
                    </p>

                    <span
                      className={
                        item.completed
                          ? "i-status-success"
                          : "i-status-pending"
                      }
                    >
                      {item.completed
                        ? "Completed"
                        : "In Progress"}
                    </span>

                  </div>

                  <div className="i-session-actions">

                    <span className="i-score-pill">
                      {item.feedback?.score || 0}/10
                    </span>

                    <button
                      className="i-btn-primary"
                      onClick={() =>
                        fetchInterviewReport(item._id)
                      }
                    >
                      View Report
                    </button>

                  </div>
                </div>
              ))
            ) : (
              <p>No interview history found.</p>
            )}

          </section>
        )}

        {/* REPORT PAGE */}
        {mode === "report" &&
          selectedInterview && (
            <section className="i-full-width-card">

              <div className="i-page-header">

                <button
                  className="i-btn-secondary"
                  onClick={() =>
                    setMode("history")
                  }
                >
                  ← Back
                </button>

                <h2>
                  {selectedInterview.role}
                  {" "}
                  Interview Report
                </h2>

              </div>

              {reportLoading ? (
                <LoaderView message="Loading report..." />
              ) : (
                <>
                  <div className="i-report-hero">

                    <div className="i-report-score">
                      {selectedInterview.feedback
                        ?.score || 0}
                    </div>

                    <div>

                      <h3>
                        Overall Performance
                      </h3>

                      <p>
                        Completed on{" "}
                        {new Date(
                          selectedInterview.createdAt
                        ).toLocaleDateString()}
                      </p>

                    </div>

                  </div>

                  <div className="i-report-grid">

                    <div className="i-report-card">

                      <h3>Summary</h3>

                      <p>
                        {
                          selectedInterview.feedback
                            ?.summary
                        }
                      </p>

                    </div>

                    <div className="i-report-card">

                      <h3>Strengths</h3>

                      <ul>
                        {selectedInterview.feedback?.strengths?.map(
                          (item, index) => (
                            <li key={index}>
                              ✓ {item}
                            </li>
                          )
                        )}
                      </ul>

                    </div>

                    <div className="i-report-card">

                      <h3>Areas to Improve</h3>

                      <ul>
                        {selectedInterview.feedback?.improvements?.map(
                          (item, index) => (
                            <li key={index}>
                              • {item}
                            </li>
                          )
                        )}
                      </ul>

                    </div>

                  </div>

                  <div className="i-qa-section">

                    <h3>
                      Questions & Answers
                    </h3>

                    {selectedInterview.questions?.map(
                      (question, index) => (
                        <div
                          key={index}
                          className="i-qa-card"
                        >
                          <h4>
                            Question {index + 1}
                          </h4>

                          <p className="i-question">
                            {question}
                          </p>

                          <h4>Your Answer</h4>

                          <p className="i-answer">
                            {
                              selectedInterview
                                .answers?.[index]
                            }
                          </p>
                        </div>
                      )
                    )}

                  </div>
                </>
              )}

            </section>
          )}

      </div>
    </main>
  );
}