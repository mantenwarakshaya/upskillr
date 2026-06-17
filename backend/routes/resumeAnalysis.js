// backend/routes/resumeAnalysis.js
const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");
const { userAuth } = require("../middleware/auth"); 
const { analyzeResumeController } = require("../controllers/resumeController");
const ResumeAnalysis = require("../models/ResumeAnalysis"); 

/**
 * @route   POST /api/resume/resume-analysis
 * @desc    Upload a resume file (.pdf/.docx) and run Gemini AI analysis
 * @access  Protected
 */
router.post(
  "/resume-analysis",
  userAuth,
  upload.single("resume"), // Listens for the form-data key named 'resume'
  analyzeResumeController
);

/**
 * @route   GET /api/resume/resume-analysis/latest
 * @desc    Fetch the user's most recent resume analysis log for instant dashboard loads
 * @access  Protected
 */
router.get("/resume-analysis/latest", userAuth, async (req, res) => { 
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: "Unauthorized profile request session." });
    }

    // Grab the absolute latest file analysis updated or created by the current user
    const latestAnalysis = await ResumeAnalysis.findOne({ userId: req.user._id })
      .sort({ createdAt: -1 });
    
    if (latestAnalysis) {
      return res.status(200).json({ 
        success: true, 
        data: latestAnalysis 
      });
    }
    
    return res.status(404).json({ 
      success: false, 
      message: "No previous resume analysis found in your profile footprint." 
    });
  } catch (err) {
    console.error("❌ Router Error fetching latest resume:", err.message);
    return res.status(500).json({ 
      success: false, 
      message: err.message || "Internal database retrieval failure." 
    });
  }
});

module.exports = router;