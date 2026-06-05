const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GAP_ANALYSIS_GEMINI_KEY);

const generateRoadmap = async (
  targetRole,
  missingSkills,
  matchPercentage,
  strengths = []
) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const prompt = `
You are an elite Engineering Learning Architect and Senior Career Mentor. 
Generate a high-density, actionable technical training roadmap to bridge specific profile gaps.

TARGET ROLE: ${targetRole}
MATCH SCORE: ${matchPercentage}%
USER STRENGTHS: ${strengths.length ? strengths.join(", ") : "None provided"}
MISSING SKILLS (CRITICAL FOCUS): ${missingSkills.join(", ")}

CRITICAL FORMATTING RULES:
1. Maximize Data Density: Avoid generic phrasing ("learn the basics", "delve deeper"). Provide specific sub-modules, framework names, architectural configurations, and syntax patterns.
2. Target the Deficits: Weight topics, tasks, and capstone features heavily toward remediation of the MISSING SKILLS list. 
3. Length Constraints: Keep project descriptions and phase objectives to a maximum of 2 clean, punchy sentences. Keep list array items under 8 words.

JSON SCHEMA REQUIREMENT:
Return ONLY valid raw JSON matching this structure exactly:
{
  "targetRole": "${targetRole}",
  "totalEstimatedDuration": "e.g., 12-16 Weeks",
  "roadmap": [
    {
      "phase": "Phase 1: Clear Structural Title",
      "objective": "Targeted execution objective sentence.",
      "duration": "e.g., 3-4 weeks",
      "skills": ["Specific Tool/Library"],
      "topics": ["Advanced Architectural Pattern or Mechanism"],
      "projects": [
        {
          "title": "Application Core Feature Focus",
          "difficulty": "Beginner | Intermediate | Advanced",
          "description": "Build an app featuring [system mechanics] to manage [concrete problem solution]."
        }
      ],
      "resources": {
        "courses": ["Course Title or Provider name"],
        "documentation": ["Official Documentation Link Name"]
      }
    }
  ],
  "capstoneProject": {
    "title": "Enterprise Level Project Name",
    "description": "Production-grade system scenario testing integration and end-to-end deployment of core missing modules.",
    "skillsCovered": ["Skill Name"]
  },
  "jobPreparation": {
    "resumeChecklist": ["Actionable checklist dynamic update metric"],
    "interviewTopics": ["Deep core concept architectural interview question area"]
  }
}
`;

    const result = await model.generateContent(prompt);
    let responseText = result.response.text();

    // 1. Sanitize Markdown Wrappers from AI string safely
    responseText = responseText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    // 2. Safe Parse Execution
    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      console.error("JSON Parsing failed. Raw text output was:", responseText);
      throw new SyntaxError("Failed to parse Gemini JSON payload cleanly.");
    }

  } catch (error) {
    console.error(
      "Roadmap Generation Error:",
      error.status,
      error.message
    );

    const message = error.message?.toLowerCase() || "";

    if (
      error.status === 503 ||
      message.includes("503")
    ) {
      throw new Error("Server is busy. Please try again later.");
    }

    if (
      error.status === 429 ||
      message.includes("quota")
    ) {
      throw new Error("AI quota exceeded. Please try again later.");
    }

    throw new Error("Failed to generate roadmap.");
  }
};

module.exports = generateRoadmap;