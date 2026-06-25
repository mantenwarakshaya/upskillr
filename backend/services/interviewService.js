const { getModel, callWithRetry } = require("../config/gemini.js");

const model = getModel("gemini-2.5-flash");

 const generateFirstQuestion = async (role) => {
  const prompt = `
You are an expert technical interviewer.

Role: ${role}

Ask ONLY the first interview question.

Rules:
- Ask exactly one question.
- Keep it professional.
- Keep it under 30 words.
- Do not include numbering.
- Do not include explanations.
`;

  try {
    const result = await callWithRetry(() =>
      model.generateContent(prompt)
    );

    return result.response.text().trim();
  } catch (error) {
    console.error(error);

    const fallbackQuestions = [
      "What is your strongest technical skill?",
      "Describe a challenging project you worked on.",
      "How do you debug production issues?",
      "What are your strengths and weaknesses?"
    ];

    return fallbackQuestions[0];
  }

};

 const generateNextQuestion = async (
  role,
  questions,
  answers,
  questionNumber
) => {
  const history = questions
    .map(
      (q, i) => `
Question ${i + 1}: ${q}
Answer ${i + 1}: ${answers[i] || ""}
`
    )
    .join("\n");

  const prompt = `
You are an expert technical interviewer.

Role: ${role}

Interview History:
${history}

Generate question ${questionNumber}.

Rules:
- Ask exactly one new question.
- Do not repeat previous questions.
- Adapt to previous answers.
- Keep it under 30 words.
- No numbering.
- No explanations.
`;

  const result = await callWithRetry(() =>
    model.generateContent(prompt)
  );

  return result.response.text().trim();
};

 const generateFeedback = async (
  role,
  questions,
  answers
) => {
  const interviewData = questions
    .map(
      (q, i) => `
Question ${i + 1}: ${q}
Answer ${i + 1}: ${answers[i] || ""}
`
    )
    .join("\n");

  const prompt = `
You are a senior technical interviewer.

Role: ${role}

Interview:
${interviewData}

Return ONLY valid JSON.

{
  "score": number,
  "strengths": ["string"],
  "improvements": ["string"],
  "summary": "string"
}

Rules:
- score must be between 1 and 10
- strengths must contain 3 points
- improvements must contain 3 points
- summary should be concise
- Return JSON only
`;

  const result = await callWithRetry(() =>
    model.generateContent(prompt)
  );

  let text = result.response.text().trim();

  text = text.replace(/```json/g, "");
  text = text.replace(/```/g, "");

  try {
    return JSON.parse(text);
  } catch (error) {
    console.error("Feedback Parse Error:", text);

    return {
      score: 5,
      strengths: ["Participated in the interview"],
      improvements: ["Provide more detailed answers"],
      summary:
        "Feedback generation failed. Please try again.",
    };
  }
};

module.exports = {
  generateFirstQuestion,
  generateNextQuestion,
  generateFeedback,
};