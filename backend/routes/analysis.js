const express = require("express");

const analyzeSkills = require("../utils/skillAnalyzer");
const generateRoadmap = require("../utils/roadmapGenerator");

const { userAuth } = require("../middleware/auth");
const User = require("../models/user");

const router = express.Router();

router.get("/analyze-skills", userAuth, async (req, res) => {
  try {

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const result = analyzeSkills(
      user.targetRole,
      user.skills
    );

    user.analysisHistory.push({
      role: user.targetRole,
      matchPercentage: result.matchPercentage,
      missingSkills: result.missingSkills,
      strengths: result.strengths,
      roadmap: result.roadmap,
    });

    await user.save();

    return res.status(200).json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

router.get("/roadmap", userAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const analysis = analyzeSkills(
      user.targetRole,
      user.skills
    );

    const roadmapData = await generateRoadmap(
      user.targetRole,
      analysis.missingSkills,
      analysis.matchPercentage,
      analysis.strengths
    );

    return res.status(200).json({
      success: true,
      roadmap: roadmapData,
    });
  } catch (error) {
    console.error("Roadmap Generation Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate roadmap",
    });
  }
});
module.exports = router;