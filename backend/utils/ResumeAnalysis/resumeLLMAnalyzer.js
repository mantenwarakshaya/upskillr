const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const analyzeResumeWithLLM = async ({
  targetRole,
  resumeText,
  extractedSkills,
}) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
You are a senior engineering hiring manager.

Target Role:
${targetRole}

Resume:
${resumeText}

Extracted Skills:
${JSON.stringify(extractedSkills)}

Return ONLY valid JSON.

{
  "overallScore": 0,
  "candidateLevel": "",
  "summary": "",
  "strengths": [],
  "weaknesses": [],
  "projectEvaluation": "",
  "resumeFeedback": [],
  "interviewReadiness": "",
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
      overallScore: 0,
      candidateLevel: "Unknown",
      summary: "AI analysis unavailable",
      strengths: [],
      weaknesses: [],
      projectEvaluation: "",
      resumeFeedback: [],
      interviewReadiness: "Unknown",
    };
  }
};

module.exports = analyzeResumeWithLLM;