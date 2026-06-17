// backend/models/JobAnalysis.js
const mongoose = require("mongoose");

const jobAnalysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetRole: {
      type: String,
      required: true,
    },
    analysis: {
      type: Object,
      default: {},
    },
    jobs: {
      type: Array,
      default: [],
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Add a compound index to quickly find historical data per user per role
jobAnalysisSchema.index({ userId: 1, targetRole: 1 });

module.exports = mongoose.model("JobAnalysis", jobAnalysisSchema);