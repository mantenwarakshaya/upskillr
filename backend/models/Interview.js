const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
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

    questions: [String],

    answers: [String],

    score: Number,

    strengths: [String],

    weaknesses: [String],

    recommendations: [String],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Interview", interviewSchema);