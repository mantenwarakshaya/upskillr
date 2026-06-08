const express = require("express");

const router = express.Router();

const { userAuth } = require(
  "../middleware/auth"
);

const JobAnalysis = require(
  "../models/JobAnalysis"
);

const jobAnalysisService = require(
  "../services/jobAnalysisService"
);

const jobAnalysisController = require(
  "../controllers/jobAnalysisController"
);

router.post(
  "/job-analysis",
  userAuth,
  jobAnalysisController
);

router.post(
  "/job-analysis/latest",
  userAuth,
  async (req, res) => {
    try {
      const { targetRole } = req.body;

      await JobAnalysis.deleteOne({
        userId: req.user._id,
        targetRole,
      });

      const result =
        await jobAnalysisService(
          req.user._id,
          targetRole
        );

      res.json(result);
    } catch (err) {
      console.error(err);

      res.status(500).json({
        message:
          "Failed to refresh analysis",
      });
    }
  }
);

module.exports = router;