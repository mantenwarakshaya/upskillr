const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const extractResumeData = async (resumeText) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-3.5-flash",
  });

  const prompt = `
You are an expert resume parser.

Extract information from the resume.

Resume:
${resumeText}

Return ONLY valid JSON.

{
  "skills": [],
  "projects": [],
  "experience": [],
  "education": [],
  "certifications": [],
  "summary": ""
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
};

module.exports = extractResumeData;