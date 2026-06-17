// backend/routes/gapAnalysis.js
const express = require("express");
const router = express.Router();

const { userAuth } = require("../middleware/auth");
const gapAnalysisController = require("../controllers/gapAnalysisController");

/**
 * @route   GET /api/gap-analysis/roadmap
 * @desc    Retrieve cached or freshly generated career development tracks
 * @access  Protected
 */
router.get("/gap-analysis", userAuth, gapAnalysisController.getRoadmap);

/**
 * @route   GET /api/gap-analysis/latest-analysis
 * @desc    Fetch quick metrics (match percentage, gaps) for dashboard rendering
 * @access  Protected
 */
router.get("/gap-analysis/latest", userAuth, gapAnalysisController.getLatestAnalysis);

module.exports = router;