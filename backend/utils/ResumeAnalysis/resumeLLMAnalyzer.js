// backend/utils/ResumeAnalysis/resumeLLMAnalyzer.js
const { getModel, callWithRetry } = require("../../config/gemini");

const analyzeResumeWithLLM = async ({ targetRole, resumeText, extractedSkills }) => {
  try {
    const model = getModel("gemini-2.5-flash");

    const prompt = `
      You are a senior engineering hiring manager. Review this candidate for the target job role.
      Target Role: ${targetRole}
      Extracted Skills: ${JSON.stringify(extractedSkills)}
      
      Raw Resume Data:
      ${resumeText}

      Return a valid JSON object matching this schema exactly. No trailing commas, no markdown wrap:
      {
        "overallScore": 85,
        "candidateLevel": "Mid-Level",
        "summary": "Detailed summary assessment.",
        "strengths": ["strength1", "strength2"],
        "weaknesses": ["weakness1"],
        "projectEvaluation": "Feedback regarding highlighted portfolio items",
        "resumeFeedback": ["formatting suggestion", "metric improvement"],
        "interviewReadiness": "Ready / Needs Practice"
      }
    `;

    const responseText = await callWithRetry(async () => {
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    });

    const cleanJSONString = responseText.replace(/^```json|```$/gi, "").trim();
    return JSON.parse(cleanJSONString);

  } catch (err) {
    console.error("❌ Gemini Resume Evaluation Logic Exception:", err.message);
    // Safe seamless fallback so your backend route never crashes completely
    return {
      overallScore: 0,
      candidateLevel: "Unknown",
      summary: "AI evaluation sub-service was temporarily interrupted.",
      strengths: [],
      weaknesses: [],
      projectEvaluation: "Unavailable",
      resumeFeedback: ["Please re-trigger analysis shortly."],
      interviewReadiness: "Pending adjustment"
    };
  }
};

module.exports = analyzeResumeWithLLM;