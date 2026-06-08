const express = require("express");

const upload = require("../middleware/upload");
// Match the exported name 'userAuth' from your middleware file
const { userAuth } = require("../middleware/auth"); 
const { analyzeResumeController } = require("../controllers/resumeController");
const ResumeAnalysis = require("../models/ResumeAnalysis"); 
const router = express.Router();

// 1. Core Upload/Analysis Action (Protected)
router.post(
  "/resume-analysis",
  userAuth, // Use the correct function name here
  upload.single("resume"),
  analyzeResumeController
);

// 2. Fetch Cached Record for Instant Load (Protected)
router.get("/resume-analysis/latest", userAuth, async (req, res) => { 
  try {
    // Safety check for auth middleware pipeline
    // Your middleware populates req.user, so we check for user and its _id
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const latest = await ResumeAnalysis.findOne({ userId: req.user._id })
      .sort({ createdAt: -1 });
    
    if (latest) {
      return res.status(200).json({ success: true, data: latest });
    }
    
    return res.status(404).json({ success: false, message: "No previous analysis found" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;