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
router.get("/", userAuth, gapAnalysisController.getRoadmap);

// History
router.get(
  "/history",
  userAuth,
  gapAnalysisController.getHistory
);

// Single report
router.get(
  "/:id",
  userAuth,
  gapAnalysisController.getRoadmapById
);

module.exports = router; 