const mongoose = require('mongoose');

const ResumeAnalysisSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetRole: { type: String, required: true },
    resumeData: Object,
    extractedSkills: [String],
    analysis: Object,
    aiAnalysis: Object,
  },
  { timestamps: true }
);

module.exports = mongoose.model('ResumeAnalysis', ResumeAnalysisSchema);