const fs = require("fs");
const parseResume = require("../utils/resumeParser");
const analyzeSkills = require("../utils/skillAnalyzer");
const analyzeResumeWithLLM = require("../utils/resumeLLMAnalyzer");
const extractResumeData = require("../utils/extractResumeData");

const analyzeResumeController = async (req, res) => {
  const filePath = req.file?.path;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Resume file not received",
      });
    }

    const { targetRole } = req.body;

    if (!targetRole) {
      return res.status(400).json({
        success: false,
        message: "Target role parameter is required",
      });
    }

    // Parse Resume
    const resumeText = await parseResume(filePath);

    // Extract Skills
    const resumeData =
      await extractResumeData(resumeText);

    const extractedSkills =
      resumeData.skills || [];

    // Rule-based Analysis
    const analysis = analyzeSkills(
      targetRole,
      extractedSkills
    );

    if (analysis.error) {
      return res.status(422).json({
        success: false,
        message: analysis.error,
      });
    }

    // AI Analysis
    const aiAnalysis = await analyzeResumeWithLLM({
      targetRole,
      resumeText,
      extractedSkills,
      matchPercentage: analysis.matchPercentage,
      strengths: analysis.strengths,
      missingSkills: analysis.missingSkills,
    });

    return res.status(200).json({
      success: true,
      resumeData,
      extractedSkills,
      analysis,
      aiAnalysis,
    });
  } catch (err) {
    console.error("Resume Analysis Error:", err);

    return res.status(500).json({
      success: false,
      message:
        err.message || "Internal processing error occurred.",
    });
  } finally {
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(
          `Successfully removed temporary file: ${filePath}`
        );
      } catch (unlinkErr) {
        console.error(
          "Failed to delete temp file:",
          unlinkErr
        );
      }
    }
  }
};

module.exports = {
  analyzeResumeController,
};