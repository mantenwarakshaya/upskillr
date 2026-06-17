// backend/models/ResumeAnalysis.js
const mongoose = require("mongoose");

const ResumeAnalysisSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    targetRole: { 
      type: String, 
      required: true,
      trim: true
    },
    resumeData: {
      type: Object,
      default: {}
    },
    extractedSkills: {
      type: [String],
      default: []
    },
    aiAnalysis: {
      type: Object,
      default: {}
    }
  },
  { 
    timestamps: true // Automatically handles createdAt and updatedAt hooks
  }
);

// Indexes for super-fast retrieval when users refresh their cache profiles
ResumeAnalysisSchema.index({ userId: 1, targetRole: 1 });

module.exports = mongoose.model("ResumeAnalysis", ResumeAnalysisSchema);