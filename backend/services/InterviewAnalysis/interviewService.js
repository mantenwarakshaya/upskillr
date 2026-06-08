const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

const generateQuestion = async (
  targetRole,
  history
) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

  const prompt = `
Target Role: ${targetRole}

Interview History:
${JSON.stringify(history)}

Ask next interview question.

Return only question text.
`;

  const result = await model.generateContent(prompt);

  return result.response.text();
};

module.exports = {
  generateQuestion,
};