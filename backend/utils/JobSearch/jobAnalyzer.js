// backend/utils/JobSearch/jobAnalyzer.js
const { getModel, callWithRetry } = require("../../config/gemini");

const analyzeJobMarket = async (targetRole, userSkills, jobs, demandData) => {
  try {
    const model = getModel("gemini-2.5-flash");

    const prompt = `
      You are an expert career and job market analyst specializing in the tech ecosystem.
      Analyze the user's current alignment against real-time market openings and live industry research data.

      Target Role:
      ${targetRole}

      User Skills:
      ${JSON.stringify(userSkills)}

      Industry Research Data:
      ${JSON.stringify(demandData)}

      Live Job Listings:
      ${JSON.stringify(jobs)}

      Evaluate these parameters objectively. Calculate a data-driven jobReadinessScore (0-100) based on how well the user's skills cover the requirements found in the job listings and industry data.
      Return ONLY a valid JSON object matching this structure exactly. Do not include markdown blocks, text wrappers, or comments:
      {
        "targetRole": "${targetRole}",
        "demandLevel": "High / Medium / Low",
        "marketSummary": "Concise overview of the current landscape in India.",
        "salaryInsights": "Average fresher/junior compensation patterns based on research context.",
        "futureOutlook": "Short-term horizon growth predictions.",
        "topRoles": ["Role Title Variant A", "Role Title Variant B"],
        "recommendedSkills": ["Crucial Skill A", "Crucial Skill B"],
        "skillGapForMarket": ["Specific missing skills causing resistance in applying to these live jobs"],
        "jobReadinessScore": 75
      }
    `;

    const responseText = await callWithRetry(async () => {
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    });

    // Strip extraneous markdown wrappers if present
    let cleanJSONString = responseText.replace(/^```json|```$/gi, "").trim();
    if (cleanJSONString.startsWith("```")) {
      cleanJSONString = cleanJSONString.split(/```(?:json)?/)[1] || cleanJSONString;
      cleanJSONString = cleanJSONString.split("```")[0].trim();
    }

    return JSON.parse(cleanJSONString);
  } catch (err) {
    console.error("❌ Gemini Job Market Analysis Engine failure:", err.message);
    return null;
  }
};

module.exports = analyzeJobMarket;