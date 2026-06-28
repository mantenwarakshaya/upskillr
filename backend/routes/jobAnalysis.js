const express = require("express");
const router = express.Router();

const { userAuth } = require("../middleware/auth");
const JobAnalysis = require("../models/JobAnalysis");
const jobAnalysisController = require("../controllers/jobAnalysisController");

/**
 * @route   POST /api/job
 * @desc    Run (or return cached) job market analysis for a target role
 * @access  Protected
 */
router.post("/", userAuth, jobAnalysisController);

/**
 * @route   GET /api/job/history
 * @desc    All past job analyses for the user (light projection for list view)
 * @access  Protected
 */
router.get("/history", userAuth, async (req, res) => {
  try {
    const history = await JobAnalysis.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select("_id targetRole analysis.jobReadinessScore analysis.demandLevel createdAt");

    return res.status(200).json({ success: true, history });
  } catch (err) {
    console.error("Job history error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * @route   GET /api/job/:id
 * @desc    Single full job analysis document by id
 * @access  Protected
 */
router.get("/:id", userAuth, async (req, res) => {
  try {
    const doc = await JobAnalysis.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!doc) {
      return res.status(404).json({ success: false, message: "Analysis not found." });
    }

    return res.status(200).json({ success: true, data: doc });
  } catch (err) {
    console.error("Job by id error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;