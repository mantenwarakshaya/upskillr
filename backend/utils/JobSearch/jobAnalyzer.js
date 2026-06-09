const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

const analyzeJobMarket = async (targetRole, userSkills, jobs, demandData) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash",
    });

  const prompt = `
    You are an expert career and job market analyst.

    Target Role:
    ${targetRole}

    User Skills:
    ${JSON.stringify(userSkills)}

    Industry Research:
    ${JSON.stringify(demandData)}

    Job Listings:
    ${JSON.stringify(jobs)}

    Return ONLY valid JSON.

    {
      "targetRole":"",
      "demandLevel":"",
      "marketSummary":"",
      "salaryInsights":"",
      "futureOutlook":"",
      "topRoles":[],
      "recommendedSkills":[],
      "skillGapForMarket":[],
      "jobReadinessScore":0
    }
    `;

    const result = await model.generateContent(prompt);

    const text = result.response.text();

    return JSON.parse(
      text.replace(/```json/g, "").replace(/```/g, "")
    );
  } catch (err) {
    console.error(err);
    return null;
  }
};

module.exports = analyzeJobMarket;