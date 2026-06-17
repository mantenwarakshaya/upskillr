// backend/controllers/gapAnalysisController.js
const ResumeAnalysis = require("../models/ResumeAnalysis");
const generateRoadmap = require("../utils/GapAnalysis/roadmapGenerator");
const Roadmap = require("../models/Roadmap");
const User = require("../models/user");

/**
 * Generates or retrieves a cached comprehensive career development roadmap track.
 */
const getRoadmap = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User profile target context missing." });
    }

    const latestResume = await ResumeAnalysis.findOne({
      userId: req.user._id,
    }).sort({ createdAt: -1 });

    if (!latestResume) {
      return res.status(400).json({
        success: false,
        message: "Please complete Resume Analysis first before rendering adaptive maps.",
      });
    }

    const activeRole = latestResume.targetRole || user.targetRole;

    // Smart Cache Evaluation Pass
    const existingRoadmap = await Roadmap.findOne({ userId: user._id, targetRole: activeRole }).sort({ createdAt: -1 });

    if (existingRoadmap) {
      console.log("💸 Saved Gemini API usage: Serving cached standalone roadmap document!");
      return res.status(200).json({
        success: true,
        data: existingRoadmap,
        isCached: true 
      });
    }

    console.log("🚀 Profile delta detected. Running Single-Pass Gemini Engine for Analysis and Roadmap...");
    
    // Executes the consolidated AI evaluation call
    const completeData = await generateRoadmap(activeRole, latestResume.extractedSkills);

    // Persist ALL fields seamlessly into your unified document structure
    const savedRoadmapDoc = await Roadmap.create({
      userId: user._id,
      targetRole: activeRole,
      matchPercentage: completeData.matchPercentage || 0,
      strengths: completeData.strengths || [],
      missingSkills: completeData.missingSkills || [],
      totalEstimatedDuration: completeData.totalEstimatedDuration,
      milestones: completeData.roadmap, 
      capstoneProject: completeData.capstoneProject,
      jobPreparation: completeData.jobPreparation,
      skillsGapsTargeted: completeData.missingSkills 
    });

    user.targetRole = activeRole;
    await user.save();

    return res.status(200).json({
      success: true,
      data: savedRoadmapDoc,
      isCached: false
    });

  } catch (error) {
    console.error("❌ Roadmap Controller Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Fetches recent historical footprint metrics instantly out of the Roadmap collection for dashboard badging.
 */
const getLatestAnalysis = async (req, res) => {
  try {
    const latestRoadmap = await Roadmap.findOne({ userId: req.user._id }).sort({ createdAt: -1 });

    if (!latestRoadmap) {
      return res.status(200).json({
        success: true,
        data: null,
        hasRoadmap: false
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        role: latestRoadmap.targetRole,
        matchPercentage: latestRoadmap.matchPercentage,
        missingSkills: latestRoadmap.missingSkills,
        strengths: latestRoadmap.strengths,
        createdAt: latestRoadmap.createdAt
      },
      hasRoadmap: true 
    });
  } catch (error) {
    console.error("❌ Latest Analysis Controller Error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = {
  getRoadmap,
  getLatestAnalysis
};