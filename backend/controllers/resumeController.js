const fs = require("fs");
const parseResume = require("../utils/ResumeAnalysis/resumeParser");
// const analyzeSkills = require("../utils/GapAnalysis/skillAnalyzer");
const analyzeResumeWithLLM = require("../utils/ResumeAnalysis/resumeLLMAnalyzer");
const extractResumeData = require("../utils/ResumeAnalysis/extractResumeData");
const ResumeAnalysis = require("../models/ResumeAnalysis");

const analyzeResumeController = async (req, res) => {
  // Use _id to match your userAuth middleware
  const userId = req.user._id; 
  const filePath = req.file?.path;

  try {
    const { targetRole, refresh } = req.body;

    // STAGE 1: Check for Cached Data
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
      return res.status(400).json({ success: false, message: "Resume file not received" });
    }

    if (!targetRole) {
      return res.status(400).json({ success: false, message: "Target role parameter is required" });
    }

    // Process resume
    const resumeText = await parseResume(filePath);
    const resumeData = await extractResumeData(resumeText);
    const extractedSkills = resumeData.skills || [];

    // Rule-based Analysis
    // const analysis = analyzeSkills(targetRole, extractedSkills);

    // if (analysis.error) {
    //   return res.status(422).json({ success: false, message: analysis.error });
    // }

    // AI Analysis
    const aiAnalysis = await analyzeResumeWithLLM({
      targetRole,
      resumeText,
      extractedSkills,
      // matchPercentage: analysis.matchPercentage,
      // strengths: analysis.strengths,
      // missingSkills: analysis.missingSkills,
    });

    // --- FIX: Define finalResult before using it ---
    const finalResult = {
      targetRole,
      resumeData,
      extractedSkills,
      // analysis,
      aiAnalysis,
    };

    // Save to MongoDB using findOneAndUpdate with upsert
    await ResumeAnalysis.findOneAndUpdate(
      { userId, targetRole },
      {
        userId,
        targetRole,
        resumeData,
        extractedSkills,
        // analysis,
        aiAnalysis,
        createdAt: new Date()
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      success: true,
      data: finalResult,
    });

  } catch (err) {
    console.error("Resume Analysis Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal processing error occurred.",
    });
  } finally {
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`Successfully removed temporary file: ${filePath}`);
      } catch (unlinkErr) {
        console.error("Failed to delete temp file:", unlinkErr);
      }
    }
  }
};

module.exports = {
  analyzeResumeController,
};