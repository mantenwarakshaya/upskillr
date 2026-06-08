const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const analyzeResumeWithLLM = async ({
  targetRole,
  resumeText,
  extractedSkills,
  matchPercentage,
  strengths,
  missingSkills,
}) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash",
    });

    const prompt = `
You are a senior engineering hiring manager.

Target Role:
${targetRole}

Resume:
${resumeText}

Extracted Skills:
${JSON.stringify(extractedSkills)}

Role Match Analysis:
${matchPercentage}%

Strengths:
${strengths.join(", ")}

Missing Skills:
${missingSkills.join(", ")}

Return ONLY valid JSON.

{
  "overallScore": 0,
  "candidateLevel": "",
  "summary": "",
  "strengths": [],
  "weaknesses": [],
  "missingSkills": [],
  "projectEvaluation": "",
  "resumeFeedback": [],
  "careerRecommendations": [],
  "interviewReadiness": "",
  "roadmap": [
    {
      "phase": "",
      "duration": "",
      "topics": []
    }
  ]
}
`;

    const result = await model.generateContent(prompt);

    const response =
      result.response.candidates[0].content.parts[0].text;

    const cleaned = response
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Gemini Analysis Error:", err);

    return {
      overallScore: matchPercentage,
      candidateLevel: "Unknown",
      summary: "AI analysis unavailable",
      strengths,
      weaknesses: missingSkills,
      missingSkills,
      projectEvaluation: "",
      resumeFeedback: [],
      careerRecommendations: [],
      interviewReadiness: "Unknown",
      roadmap: [],
    };
  }
};

module.exports = analyzeResumeWithLLM;