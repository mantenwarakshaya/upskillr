// backend/controllers/resumeController.js

const fs = require("fs");
const parseResume = require("../utils/ResumeAnalysis/resumeParser");
const extractResumeData = require("../utils/ResumeAnalysis/extractResumeData");
const analyzeResumeWithLLM = require("../utils/ResumeAnalysis/resumeLLMAnalyzer");
const ResumeAnalysis = require("../models/ResumeAnalysis");
const { deductCredits } = require("../utils/credits/creditManager");

const analyzeResumeController = async (req, res) => {
  const userId   = req.user?._id;
  const filePath = req.file?.path;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized account context verification." });
  }

  try {
    const { targetRole, refresh } = req.body;

    // ── STAGE 1: Validate inputs before touching cache ──────────
    // Validate these first so we never hit the cache check with bad params
    if (!targetRole) {
      return res.status(400).json({ success: false, message: "Target role parameter is required." });
    }

    // ── STAGE 2: Cache check ─────────────────────────────────────
    // Only skip cache when refresh=true AND a file was actually uploaded
    if (!refresh) {
      const existingAnalysis = await ResumeAnalysis.findOne({ userId, targetRole });
      if (existingAnalysis) {
        // Clean up the uploaded file even on a cache hit — it won't be used
        if (filePath && fs.existsSync(filePath)) {
          try { fs.unlinkSync(filePath); } catch (_) {}
        }
        return res.status(200).json({
          success: true,
          fromCache: true,
          data: existingAnalysis,
        });
      }
    }

    // A file is required if we're doing a fresh analysis
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Resume attachment payload file not received." });
    }

    // ── STAGE 3: AI pipeline ─────────────────────────────────────
    const resumeText      = await parseResume(filePath);
    const resumeData      = await extractResumeData(resumeText);
    const extractedSkills = resumeData.skills || [];

    const aiAnalysis = await analyzeResumeWithLLM({
      targetRole,
      resumeText,
      extractedSkills,
    });

    // ── STAGE 4: Persist BEFORE deducting credits ────────────────
    // If the save throws, credits are never touched — no silent loss
    const savedDocument = await ResumeAnalysis.findOneAndUpdate(
      { userId, targetRole },
      { userId, targetRole, resumeData, extractedSkills, aiAnalysis },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Deduct only after a confirmed successful save
    await deductCredits(req.user._id, 4);

    return res.status(200).json({
      success: true,
      data: savedDocument,
    });

  } catch (err) {
    console.error("🔥 Resume Controller Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal application parsing error occurred.",
    });
  } finally {
    // Always clean up the temp file regardless of outcome
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`🧹 Removed temporary file: ${filePath}`);
      } catch (unlinkErr) {
        console.error("⚠️ File unlink warning:", unlinkErr.message);
      }
    }
  }
};

module.exports = { analyzeResumeController };