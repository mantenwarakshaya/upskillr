// backend/models/Roadmap.js
const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  difficulty: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], default: "Intermediate" },
  description: { type: String, required: true }
});

const MilestonePhaseSchema = new mongoose.Schema({
  phase: { type: String, required: true },
  objective: { type: String, required: true },
  duration: { type: String, required: true },
  skills: { type: [String], default: [] },
  topics: { type: [String], default: [] },
  projects: [ProjectSchema],
  resources: {
    courses: { type: [String], default: [] },
    documentation: { type: [String], default: [] }
  }
});

const RoadmapSchema = new mongoose.Schema(
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
    matchPercentage: {
      type: Number,
      default: 0
    },
    strengths: {
      type: [String],
      default: []
    },
    missingSkills: {
      type: [String],
      default: []
    },
    totalEstimatedDuration: { 
      type: String, 
      required: true 
    },
    milestones: [MilestonePhaseSchema],
    capstoneProject: {
      title: { type: String, required: true },
      description: { type: String, required: true },
      skillsCovered: { type: [String], default: [] }
    },
    jobPreparation: {
      resumeChecklist: { type: [String], default: [] },
      interviewTopics: { type: [String], default: [] }
    },
    skillsGapsTargeted: { 
      type: [String], 
      default: [] 
    }
  },
  { 
    timestamps: true 
  }
);

module.exports = mongoose.model("Roadmap", RoadmapSchema);