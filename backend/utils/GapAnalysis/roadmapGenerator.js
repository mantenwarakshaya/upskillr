// backend/utils/GapAnalysis/roadmapGenerator.js
const { getModel, callWithRetry } = require("../../config/gemini");

const generateRoadmap = async (targetRole, userSkills) => {
  try {
    const model = getModel("gemini-2.5-flash");

    const prompt = `
      You are an elite Engineering Learning Architect and Career Transition Analyst. 
      Evaluate the user's current skills against the benchmark expectations for a proficient ${targetRole}.
      
      USER'S CURRENT SKILLS:
      ${JSON.stringify(userSkills)}

      Perform a thorough gap analysis and generate a complete career development track.
      Return ONLY a valid JSON object matching this structure exactly. Do not include conversational markdown block wrappers, ticks, or text:
      {
        "matchPercentage": 75,
        "strengths": ["Skill A"],
        "missingSkills": ["Skill B"],
        "totalEstimatedDuration": "12 Weeks",
        "roadmap": [
          {
            "phase": "Phase 1: Foundation Recovery",
            "objective": "Target missing skill integrations.",
            "duration": "4 Weeks",
            "skills": ["Tool Name"],
            "topics": ["Architectural Concept"],
            "projects": [
              {
                "title": "System Integration Challenge",
                "difficulty": "Intermediate",
                "description": "Construct an ecosystem to demonstrate proficient tracking parameters."
              }
            ],
            "resources": {
              "courses": ["Official Training Block"],
              "documentation": ["Reference Guide Docs"]
            }
          }
        ],
        "capstoneProject": {
          "title": "Enterprise Scale Blueprint Platform",
          "description": "Full production environment exercising matching logic parameters.",
          "skillsCovered": ["Target Core Skill"]
        },
        "jobPreparation": {
          "resumeChecklist": ["Incorporate operational system scale indicators"],
          "interviewTopics": ["Advanced algorithmic core runtime complexities"]
        }
      }
    `;

    const responseText = await callWithRetry(async () => {
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    });

    let cleanJSONString = responseText.replace(/^```json|```$/gi, "").trim();
    
    // Extraneous markdown syntax fallback cleanup
    if (cleanJSONString.startsWith("```")) {
      cleanJSONString = cleanJSONString.split(/```(?:json)?/)[1] || cleanJSONString;
      cleanJSONString = cleanJSONString.split("```")[0].trim();
    }

    return JSON.parse(cleanJSONString);

  } catch (err) {
    console.error("❌ Gemini Single-Pass Engine module crash:", err.message);
    throw new Error(`Failed to process profile alignment and career map maps: ${err.message}`);
  }
};

module.exports = generateRoadmap;