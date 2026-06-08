const express = require("express");

const analyzeSkills = require("../utils/GapAnalysis/skillAnalyzer");
const generateRoadmap = require("../utils/GapAnalysis/roadmapGenerator");

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

// Add this new endpoint to your router
router.get("/latest-analysis", userAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const latestAnalysis = user.analysisHistory.length > 0 
      ? user.analysisHistory[user.analysisHistory.length - 1] 
      : null;

    return res.status(200).json({
      success: true,
      data: latestAnalysis,
      hasRoadmap: !!user.currentSavedRoadmap // Evaluates to true if a cached roadmap exists!
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
});

// Update your existing /roadmap endpoint to make sure it returns data cleanly
router.get("/roadmap", userAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 1. Calculate their current profile state
    const currentAnalysis = analyzeSkills(user.targetRole, user.skills);

    // 2. SMART CACHE CHECK: If a saved roadmap exists and matches their target role, check closer
    if (user.currentSavedRoadmap && user.currentSavedRoadmap.targetRole === user.targetRole) {
      
      // Let's grab the missing skills that the saved roadmap was built to fix
      const cachedGaps = user.currentSavedRoadmap.skillsGapsTargeted || [];
      const currentGaps = currentAnalysis.missingSkills || [];

      // Check if the skills match exactly
      const gapsMatch = cachedGaps.length === currentGaps.length && 
                        cachedGaps.every(skill => currentGaps.includes(skill));

      if (gapsMatch) {
        console.log("💸 Saved Gemini API usage: Serving cached roadmap from MongoDB!");
        return res.status(200).json({
          success: true,
          data: user.currentSavedRoadmap,
          isCached: true // Frontend can use this to know no fresh API cost was used
        });
      }
    }

    // 3. CACHE MISS: Only call Gemini if the gaps are different or it's a completely new role
    console.log("🚀 Profile delta detected. Initiating fresh Gemini API generation call...");
    
    const freshRoadmapData = await generateRoadmap(
      user.targetRole,
      currentAnalysis.missingSkills,
      currentAnalysis.matchPercentage,
      currentAnalysis.strengths
    );

    // Tag the data structure with the exact gaps it targets so we can check it next time
    freshRoadmapData.skillsGapsTargeted = currentAnalysis.missingSkills;

    // Save this freshly generated roadmap to the database cache
    user.currentSavedRoadmap = freshRoadmapData;
    await user.save();

    return res.status(200).json({
      success: true,
      data: freshRoadmapData,
      isCached: false
    });

  } catch (error) {
      console.error("Roadmap Generation Error:", error);

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
});

module.exports = router;