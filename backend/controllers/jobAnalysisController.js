// backend/controllers/jobAnalysisController.js
const jobAnalysisService = require("../services/jobAnalysisService");

const { deductCredits } = require("../utils/credits/creditManager");

const jobAnalysisController = async (req, res) => {
  try {
    const { targetRole } = req.body;

    if (!targetRole) {
      return res.status(400).json({ success: false, message: "Target role parameter is required." });
    }

    const result = await jobAnalysisService(req.user._id, targetRole);

    await deductCredits(req.user._id, 4);
    
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    console.error("❌ Job Analysis Controller Exception:", err.message);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error analyzing job metrics.",
    });
  }
};

module.exports = jobAnalysisController;