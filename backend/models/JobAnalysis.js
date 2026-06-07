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

module.exports = mongoose.model(
  "JobAnalysis",
  jobAnalysisSchema
);