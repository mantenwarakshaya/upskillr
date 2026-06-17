// backend/routes/jobAnalysis.js
const express = require("express");
const router = express.Router();

const { userAuth } = require("../middleware/auth");
const JobAnalysis = require("../models/JobAnalysis");
const jobAnalysisService = require("../services/jobAnalysisService");
const jobAnalysisController = require("../controllers/jobAnalysisController");

/**
 * @route   POST /api/job-market/analyze
 * @desc    Fetch cached or freshly calculated market demand and match listings
 * @access  Protected
 */
router.post("/job-analysis", userAuth, jobAnalysisController);

/**
 * @route   POST /api/job-market/latest
 * @desc    Fetch the latest job market analysis for a given target role
 * @access  Protected
 */
router.get("/job-analysis/latest", userAuth, async (req, res) => {
  try {
    const latest = await JobAnalysis.findOne({
      userId: req.user._id,
    }).sort({ createdAt: -1 });

    if (!latest) {
      return res.status(404).json({
        success: false,
        message: "No previous job analysis found",
      });
    }

    res.status(200).json({
      success: true,
      data: latest,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});
module.exports = router;