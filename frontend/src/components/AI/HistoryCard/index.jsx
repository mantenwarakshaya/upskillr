// components/HistoryCard.jsx
import React from 'react';
import { FaRegClock, FaSpinner } from 'react-icons/fa';
import './index.css'

export function HistoryCard({ score, scoreClass, label, date, status, onClick, isLoading }) {
  return (
    <div className="hc-card">
      <div className="hc-left">
        <div className={`hc-score ${scoreClass}`}>
          {score}<span>/10</span>
        </div>
        <div className="hc-meta">
          <strong className="hc-role">{label}</strong>
          <span className="hc-date">
            <FaRegClock /> {date}
          </span>
          {status && (
            <span className={`hc-status-badge ${status === "Completed" ? "hc-status--done" : "hc-status--progress"}`}>
              {status}
            </span>
          )}
        </div>
      </div>
      <button className="hc-btn-view" onClick={onClick} disabled={isLoading}>
        {isLoading ? <FaSpinner className="i-spin" /> : "View Report"}
      </button>
    </div>
  );
}