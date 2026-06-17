// backend/utils/ResumeAnalysis/extractResumeData.js
const { getModel, callWithRetry } = require("../../config/gemini");

const extractResumeData = async (resumeText) => {
  try {
    // Using gemini-2.5-flash as specified in your setup helper configuration
    const model = getModel("gemini-2.5-flash");

    const prompt = `
      You are an expert automated resume parsing system. Extract structural data from the following text.
      Return a valid JSON object matching this schema exactly. Do not wrap output in markdown formatting blocks:

      {
        "skills": ["skill1", "skill2"],
        "projects": ["project1"],
        "experience": ["job1"],
        "education": ["degree1"],
        "certifications": ["cert1"],
        "summary": "Professional overview string"
      }

      Resume Raw Text:
      ${resumeText}
    `;

    const responseText = await callWithRetry(async () => {
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    });

    // Remove any accidental markdown backticks just in case
    const cleanJSONString = responseText.replace(/^```json|```$/gi, "").trim();
    return JSON.parse(cleanJSONString);

  } catch (err) {
    console.error("❌ Gemini Resume Structural Extraction Failed:", err.message);
    throw new Error("Failed to parse structural fields using Gemini.");
  }
};

module.exports = extractResumeData;