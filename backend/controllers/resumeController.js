// backend/controllers/resumeController.js
const fs = require("fs");
const parseResume = require("../utils/ResumeAnalysis/resumeParser");
const extractResumeData = require("../utils/ResumeAnalysis/extractResumeData");
const analyzeResumeWithLLM = require("../utils/ResumeAnalysis/resumeLLMAnalyzer");
const ResumeAnalysis = require("../models/ResumeAnalysis");

const { deductCredits } = require("../utils/credits/creditManager");

const analyzeResumeController = async (req, res) => {
  // Pull fields from userAuth middleware injection
  const userId = req.user?._id; 
  const filePath = req.file?.path;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized account context verification." });
  }

  try {
    const { targetRole, refresh } = req.body;

    // STAGE 1: Check cache parameters
    if (!refresh) {
      const existingAnalysis = await ResumeAnalysis.findOne({ userId, targetRole });
      if (existingAnalysis) {
        return res.status(200).json({
          success: true,
          fromCache: true,
          data: existingAnalysis
        });
      }
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Resume attachment payload file not received." });
    }

    if (!targetRole) {
      return res.status(400).json({ success: false, message: "Target role parameter is required." });
    }

    // STAGE 2: Pipeline Parsing & Gemini Transformations
    const resumeText = await parseResume(filePath);
    const resumeData = await extractResumeData(resumeText);
    const extractedSkills = resumeData.skills || [];

    const aiAnalysis = await analyzeResumeWithLLM({
      targetRole,
      resumeText,
      extractedSkills
    });

    await deductCredits(req.user._id, 4);

    // STAGE 3: Unify structures 
    const finalResult = {
      targetRole,
      resumeData,
      extractedSkills,
      aiAnalysis
    };

    // Save or update entries safely using MongoDB Upsert models
    const savedDocument = await ResumeAnalysis.findOneAndUpdate(
      { userId, targetRole },
      {
        userId,
        targetRole,
        resumeData,
        extractedSkills,
        aiAnalysis
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      success: true,
      data: savedDocument || finalResult
    });

  } catch (err) {
    console.error("🔥 Critical Core Resume Controller Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal application parsing error occurred."
    });
  } finally {
    // Always clean up uploaded scratch files locally to preserve server space
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`🧹 Successfully removed temporary system file: ${filePath}`);
      } catch (unlinkErr) {
        console.error("⚠️ Local file unlink warning:", unlinkErr.message);
      }
    }
  }
};

module.exports = {
  analyzeResumeController
};