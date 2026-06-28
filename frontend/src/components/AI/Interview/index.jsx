import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import {
  FaRocket, FaHistory, FaSpinner, FaCoins, FaClipboardCheck,
  FaChartLine, FaArrowLeft, FaCheckCircle, FaExclamationTriangle,
  FaUserTie, FaCommentDots, FaMicrophone, FaMicrophoneSlash, FaStop,
} from "react-icons/fa";
import { LoaderView } from "../../Common";
import { HistoryCard } from "../HistoryCard";
import "./index.css";

const API_BASE_URL = import.meta.env?.VITE_API_URL || "http://localhost:7777";

/* ─── Score Ring ─────────────────────────────────────────────── */
function ScoreRing({ score }) {
  const pct = (score / 10) * 100;
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const color = score >= 8 ? "var(--i-green)" : score >= 6 ? "var(--i-blue)" : "var(--i-orange)";
  const label = score >= 8 ? "Excellent" : score >= 6 ? "Good" : "Needs Work";
  return (
    <div className="i-score-ring-wrap">
      <svg className="i-score-svg" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} className="i-ring-track" />
        <circle cx="60" cy="60" r={r} className="i-ring-fill"
          style={{ strokeDasharray: circ, strokeDashoffset: offset, stroke: color }} />
        <text x="60" y="56" className="i-ring-score">{score}</text>
        <text x="60" y="72" className="i-ring-denom">/10</text>
      </svg>
      <span className="i-ring-label" style={{ color }}>{label}</span>
    </div>
  );
}

/* ─── Voice Button ───────────────────────────────────────────── */
function VoiceButton({ onTranscript, disabled }) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  const supported = typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const start = () => {
    if (!supported || listening) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      onTranscript(text);
    };
    rec.onerror = () => setListening(false);
    rec.onend  = () => setListening(false);
    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  };

  const stop = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  if (!supported) return null;

  return (
    <button
      type="button"
      className={`i-voice-btn ${listening ? "i-voice-btn--active" : ""}`}
      onClick={listening ? stop : start}
      disabled={disabled}
      title={listening ? "Stop recording" : "Speak your answer"}
    >
      {listening
        ? <><FaStop className="i-voice-icon" /> Stop</>
        : <><FaMicrophone className="i-voice-icon" /> Speak</>}
      {listening && <span className="i-voice-pulse" />}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function Interview({ user }) {
  /* ── global state ────────────────────────────────────────── */
  const [history, setHistory]                     = useState([]);
  const [mode, setMode]                           = useState("landing");
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [reportLoading, setReportLoading]         = useState(false);
  const [isLoading, setIsLoading]                 = useState(true);

  /* ── live interview state ────────────────────────────────── */
  const [interviewId, setInterviewId]   = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [questionNumber, setQuestionNumber]   = useState(1);
  const [answer, setAnswer]             = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStarting, setIsStarting]     = useState(false);
  const [liveError, setLiveError]       = useState("");

  /* ── derived ─────────────────────────────────────────────── */
  const targetRole = user?.targetRole || "";

  const avgScore = history.length > 0
    ? (() => {
        const done = history.filter(h => h.feedback?.score);
        return done.length
          ? (done.reduce((a, h) => a + h.feedback.score, 0) / done.length).toFixed(1)
          : "--";
      })()
    : "--";

  /* ── fetch history ───────────────────────────────────────── */
  const fetchHistory = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/interview/history`, { withCredentials: true });
      setHistory(res.data?.interviews || []);
    } catch (err) {
      console.error("Failed to fetch interview history:", err);
    }
  }, []);

  /* ── fetch single report ─────────────────────────────────── */
  const fetchInterviewReport = async (id) => {
    try {
      setReportLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/interview/${id}`, { withCredentials: true });
      setSelectedInterview(res.data.interview);
      setMode("report");
    } catch {
      alert("Unable to load interview report");
    } finally {
      setReportLoading(false);
    }
  };

  /* ── start interview ─────────────────────────────────────── */
  const handleStart = async () => {
    if (!targetRole.trim()) {
      setLiveError("No target role set — go to Profile Settings to add one.");
      return;
    }
    setIsStarting(true);
    setLiveError("");
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/interview/start`,
        { role: targetRole },
        { withCredentials: true }
      );
      setInterviewId(res.data.interviewId);
      setCurrentQuestion(res.data.question);
      setQuestionNumber(1);
      setAnswer("");
      setMode("live");
    } catch (err) {
      setLiveError(err.response?.data?.message || "Unable to start interview.");
    } finally {
      setIsStarting(false);
    }
  };

  /* ── submit answer ───────────────────────────────────────── */
  const handleSubmitAnswer = async () => {
    if (!answer.trim()) { setLiveError("Please provide an answer before continuing."); return; }
    setIsSubmitting(true);
    setLiveError("");
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/interview/answer`,
        { interviewId, answer },
        { withCredentials: true }
      );
      setAnswer("");

      if (res.data.completed) {
        // Interview done — fetch the full document so we have questions/answers too
        await fetchHistory();
        const full = await axios.get(`${API_BASE_URL}/api/interview/${interviewId}`, { withCredentials: true });
        setSelectedInterview(full.data.interview);
        setMode("report");
      } else {
        setCurrentQuestion(res.data.question);
        setQuestionNumber(res.data.questionNumber);
      }
    } catch (err) {
      setLiveError(err.response?.data?.message || "Unable to submit answer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── init ────────────────────────────────────────────────── */
  useEffect(() => {
    const init = async () => { await fetchHistory(); setIsLoading(false); };
    init();
  }, [fetchHistory]);

  if (isLoading) return <LoaderView message="Preparing your interview environment…" />;

  /* ════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════ */
  return (
    <main className="i-root">

      {/* ══════════════  LANDING  ══════════════ */}
      {mode === "landing" && (
        <div className="i-landing-layout">
          <section className="i-card i-main-card">
            <span className="i-eyebrow">AI Interview Simulator</span>
            <h1 className="i-display-title">Mock Interview</h1>
            <p className="i-lead">
              Practice realistic AI-powered interviews tailored to your target
              role and receive detailed performance feedback.
            </p>

            <div className="i-divider" />
            <p className="i-section-label">Interview Workflow</p>

            <div className="i-steps">
              {[
                { icon: <FaUserTie />,     title: "Role Context",        desc: "Questions are generated based on your target role and experience level." },
                { icon: <FaCommentDots />, title: "AI Interview",         desc: "Answer 5 adaptive technical and behavioural questions by voice or text." },
                { icon: <FaChartLine />,   title: "Performance Report",   desc: "Receive a score, strengths, improvement areas, and recommendations." },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="i-step-row">
                  <div className="i-step-circle">{icon}</div>
                  <div className="i-step-body"><strong>{title}</strong><span>{desc}</span></div>
                </div>
              ))}
            </div>

            {/* Role display */}
            <div className="i-field-group">
              <span className="i-section-label">Interviewing for role</span>
              {targetRole ? (
                <div className="i-role-display">
                  <FaUserTie className="i-role-icon" />
                  <span className="i-role-name">{targetRole}</span>
                  <span className="i-role-source">from your profile</span>
                </div>
              ) : (
                <div className="i-role-missing">
                  <FaExclamationTriangle />
                  No target role set — go to <strong>Profile Settings</strong> to add one.
                </div>
              )}
            </div>

            {liveError && (
              <div className="i-submit-error"><FaExclamationTriangle /> {liveError}</div>
            )}

            <div className="i-action-row">
              {history.length > 0 && (
                <button className="i-btn i-btn--ghost" onClick={() => setMode("history")}>
                  <FaHistory /> Previous Sessions
                </button>
              )}
              <button
                className="i-btn i-btn--primary"
                onClick={handleStart}
                disabled={isStarting || !targetRole}
              >
                {isStarting ? <FaSpinner className="i-spin" /> : <FaRocket />}
                {isStarting ? "Initializing…" : "Start Interview"}
              </button>
            </div>
          </section>

          <aside className="i-card i-sidebar-card">
            <p className="i-section-label">Interview Intelligence</p>
            <div className="i-metrics-stack">
              {[
                { icon: <FaCoins />,         label: "Credits Available", value: user?.aiUsage?.creditsRemaining ?? 0, accent: "blue"   },
                { icon: <FaClipboardCheck />, label: "Total Sessions",   value: history.length,                        accent: "violet" },
                { icon: <FaChartLine />,      label: "Average Score",    value: avgScore,                              accent: "green"  },
                { icon: <FaCheckCircle />,    label: "AI Engine",        value: "Active",                              accent: "green"  },
              ].map(({ icon, label, value, accent }) => (
                <div key={label} className={`i-metric-tile i-metric--${accent}`}>
                  <span className="i-metric-icon">{icon}</span>
                  <div className="i-metric-body">
                    <span className="i-metric-label">{label}</span>
                    <strong className="i-metric-value">{value}</strong>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      )}

      {/* ══════════════  LIVE INTERVIEW  ══════════════ */}
      {mode === "live" && (
        <div className="i-single-layout">
          <section className="i-card i-full-card">

            {/* Progress bar */}
            <div className="i-progress-header">
              <div className="i-progress-meta">
                <span className="i-eyebrow">Live Interview</span>
                <span className="i-progress-count">Question {questionNumber} of 5</span>
              </div>
              <div className="i-progress-track">
                <div className="i-progress-fill" style={{ width: `${(questionNumber / 5) * 100}%` }} />
              </div>
            </div>

            {/* Question bubble */}
            <div className="i-question-bubble">
              <div className="i-question-avatar">
                <FaUserTie />
              </div>
              <div className="i-question-body">
                <span className="i-question-label">AI Interviewer</span>
                <p className="i-question-text">{currentQuestion}</p>
              </div>
            </div>

            {/* Answer area */}
            <div className="i-answer-section">
              <div className="i-answer-toolbar">
                <label className="i-answer-label">Your Answer</label>
                {/* Voice input — Web Speech API, no backend call needed */}
                <VoiceButton
                  onTranscript={(text) => setAnswer(prev => prev ? `${prev} ${text}` : text)}
                  disabled={isSubmitting}
                />
              </div>
              <textarea
                className="i-answer-textarea"
                placeholder="Type your answer here, or click Speak to use your microphone…"
                value={answer}
                onChange={(e) => { setAnswer(e.target.value); setLiveError(""); }}
                rows={5}
                disabled={isSubmitting}
              />
              {liveError && (
                <div className="i-submit-error"><FaExclamationTriangle /> {liveError}</div>
              )}
              <div className="i-answer-actions">
                <span className="i-answer-hint">{answer.trim().split(/\s+/).filter(Boolean).length} words</span>
                <button
                  className="i-btn i-btn--primary"
                  onClick={handleSubmitAnswer}
                  disabled={isSubmitting || !answer.trim()}
                >
                  {isSubmitting ? <FaSpinner className="i-spin" /> : null}
                  {isSubmitting
                    ? questionNumber >= 5 ? "Generating Feedback…" : "Next Question…"
                    : questionNumber >= 5 ? "Finish Interview" : "Next Question →"}
                </button>
              </div>
            </div>

          </section>
        </div>
      )}

      {/* ══════════════  HISTORY  ══════════════ */}
      {mode === "history" && (
        <div className="i-single-layout">
          <section className="i-card i-full-card">
            <div className="i-page-nav">
              <button className="i-btn i-btn--ghost i-btn--sm" onClick={() => setMode("landing")}>
                <FaArrowLeft /> Back
              </button>
              <h2 className="i-page-title">Interview History</h2>
            </div>

            {history.length === 0 ? (
              <div className="i-empty-state">
                <FaClipboardCheck className="i-empty-icon" />
                <p>No sessions yet. Start your first interview!</p>
              </div>
            ) : (
              <div className="i-history-list">
                {history.map((item) => {
                  const score      = item.feedback?.score ?? 0;
                  const scoreClass = score >= 8 ? "hc-score--high" : score >= 6 ? "hc-score--mid" : "hc-score--low";
                  return (
                    <HistoryCard
                      key={item._id}
                      score={score}
                      denominator={10}
                      scoreClass={scoreClass}
                      label={item.role || "Interview"}
                      date={new Date(item.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                      status={item.completed ? "Completed" : "In Progress"}
                      onClick={() => fetchInterviewReport(item._id)}
                      isLoading={reportLoading}
                    />
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}

      {/* ══════════════  REPORT  ══════════════ */}
      {mode === "report" && selectedInterview && (
        <div className="i-single-layout">
          <section className="i-card i-full-card">
            <div className="i-page-nav">
              <button className="i-btn i-btn--ghost i-btn--sm" onClick={() => setMode("history")}>
                <FaArrowLeft /> Back
              </button>
              <h2 className="i-page-title">{selectedInterview.role} — Interview Report</h2>
            </div>

            {reportLoading ? <LoaderView message="Loading report…" /> : (
              <>
                {/* Hero */}
                <div className="i-report-hero">
                  <ScoreRing score={selectedInterview.feedback?.score ?? 0} />
                  <div className="i-report-hero-meta">
                    <span className="i-eyebrow">Overall Performance</span>
                    <h3 className="i-hero-role">{selectedInterview.role}</h3>
                    <p className="i-hero-sub">
                      Completed on{" "}
                      {new Date(selectedInterview.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric", month: "long", year: "numeric",
                      })}
                    </p>
                    <div className="i-hero-chips">
                      <span className="i-chip">💬 {selectedInterview.questions?.length ?? 0} Questions</span>
                      <span className="i-chip">✍️ {selectedInterview.answers?.length ?? 0} Answers</span>
                    </div>
                  </div>
                  <div className="i-summary-box">
                    <p className="i-section-label" style={{ marginBottom: "10px" }}>Summary</p>
                    <p className="i-summary-text">{selectedInterview.feedback?.summary}</p>
                  </div>
                </div>

                {/* Strengths + Improvements */}
                <div className="i-two-col">
                  <div className="i-panel">
                    <div className="i-panel-header i-panel--green">
                      <FaCheckCircle /> Strengths
                    </div>
                    <ul className="i-feedback-list">
                      {selectedInterview.feedback?.strengths?.map((item, i) => (
                        <li key={i}>
                          <span className="i-check-dot i-check-dot--green">✓</span>{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="i-panel">
                    <div className="i-panel-header i-panel--orange">
                      <FaExclamationTriangle /> Areas to Improve
                    </div>
                    <ul className="i-feedback-list">
                      {selectedInterview.feedback?.improvements?.map((item, i) => (
                        <li key={i}>
                          <span className="i-check-dot i-check-dot--orange">→</span>{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Q&A transcript */}
                <div className="i-qa-section">
                  <p className="i-section-label" style={{ marginBottom: "16px" }}>Questions & Answers</p>
                  <div className="i-qa-list">
                    {selectedInterview.questions?.map((question, idx) => (
                      <div key={idx} className="i-qa-card">
                        <div className="i-qa-number">Q{idx + 1}</div>
                        <div className="i-qa-body">
                          <p className="i-qa-question">{question}</p>
                          <div className="i-qa-answer-wrap">
                            <span className="i-qa-answer-label">Your Answer</span>
                            <p className="i-qa-answer">{selectedInterview.answers?.[idx] || "—"}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
