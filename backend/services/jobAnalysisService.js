const JobAnalysis = require(
  "../models/JobAnalysis"
);

const searchJobs = require(
  "../utils/JobSearch/jobSearch"
);

const searchRoleDemand = require(
  "../utils/JobSearch/tavilySearch"
);

const analyzeJobMarket = require(
  "../utils/JobSearch/jobAnalyzer"
);

const ResumeAnalysis = require("../models/ResumeAnalysis");

const ONE_DAY =
  24 * 60 * 60 * 1000;

const jobAnalysisService = async (
  userId,
  targetRole
) => {
  const existing =
    await JobAnalysis.findOne({
      userId,
      targetRole,
    });

  if (existing) {
    const age =
      Date.now() -
      new Date(
        existing.lastUpdated
      ).getTime();

    if (age < ONE_DAY) {
      return {
        analysis:
          existing.analysis,
        jobs: existing.jobs,
        cached: true,
      };
    }
  }

  const latestResume =
    await ResumeAnalysis.findOne({
      userId,
      targetRole,
    }).sort({ createdAt: -1 });

  if (!latestResume) {
    throw new Error(
      "Please complete Resume Analysis first"
    );
  }

  const [jobs, demandData] =
    await Promise.all([
      searchJobs(targetRole),
      searchRoleDemand(targetRole),
    ]);

  const analysis =
    await analyzeJobMarket(
      targetRole,
      latestResume.extractedSkills,
      jobs,
      demandData
    );

  await JobAnalysis.findOneAndUpdate(
    {
      userId,
      targetRole,
    },
    {
      analysis,
      jobs,
      lastUpdated: new Date(),
    },
    {
      upsert: true,
      new: true,
    }
  );

  return {
    analysis,
    jobs,
    cached: false,
  };
};

module.exports = jobAnalysisService;