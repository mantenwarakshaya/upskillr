// backend/services/jobAnalysisService.js
const JobAnalysis = require("../models/JobAnalysis");
const ResumeAnalysis = require("../models/ResumeAnalysis");
const searchJobs = require("../utils/JobSearch/jobSearch");
const searchRoleDemand = require("../utils/JobSearch/tavilySearch");
const analyzeJobMarket = require("../utils/JobSearch/jobAnalyzer");

const ONE_DAY = 24 * 60 * 60 * 1000; // 24-hour smart cache guard

const jobAnalysisService = async (userId, targetRole) => {
  // 1. Smart Cache Check
  const existing = await JobAnalysis.findOne({ userId, targetRole });

  if (existing) {
    const age = Date.now() - new Date(existing.lastUpdated).getTime();
    if (age < ONE_DAY) {
      console.log("💸 Serving cached Job Market Matrix data...");
      return {
        analysis: existing.analysis,
        jobs: existing.jobs,
        cached: true,
      };
    }
  }

  // 2. Locate their parsed profile
  const latestResume = await ResumeAnalysis.findOne({ userId }).sort({ createdAt: -1 });

  if (!latestResume) {
    throw new Error("Please complete Resume Analysis first before looking up market matches.");
  }

  console.log(`🚀 Gathering market metrics for role: "${targetRole}"...`);

  // 3. Fire parallel third-party search requests
  const [jobs, demandData] = await Promise.all([
    searchJobs(targetRole),
    searchRoleDemand(targetRole),
  ]);

  // 4. Pass results into Gemini engine
  const analysis = await analyzeJobMarket(
    targetRole,
    latestResume.extractedSkills,
    jobs,
    demandData
  );

  if (!analysis) {
    throw new Error("AI engine failed to analyze the current job market dataset.");
  }

  // 5. Atomic save/update to MongoDB
  await JobAnalysis.findOneAndUpdate(
    { userId, targetRole },
    {
      analysis,
      jobs,
      lastUpdated: new Date(),
    },
    { upsert: true, new: true }
  );

  return {
    analysis,
    jobs,
    cached: false,
  };
};

module.exports = jobAnalysisService;