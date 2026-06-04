const roles = require("../data/roles");

const analyzeSkills = (targetRole, userSkills) => {
  // Get required skills for target role
  const requiredSkills = roles[targetRole];

  // If role not found
  if (!requiredSkills) {
    return {
      error: "Target role not found",
    };
  }

  // Normalize user skills
  const normalizedUserSkills = userSkills.map(skill =>
    skill.toLowerCase()
  );

  // Find matched skills
  const matchedSkills = requiredSkills.filter(skill =>
    normalizedUserSkills.includes(skill.toLowerCase())
  );

  // Find missing skills
  const missingSkills = requiredSkills.filter(
    skill =>
      !normalizedUserSkills.includes(skill.toLowerCase())
  );

  // Calculate match percentage
  const matchPercentage = Math.round(
    (matchedSkills.length / requiredSkills.length) * 100
  );

  // Priority roadmap
  const roadmap = [...missingSkills];

  return {
    matchPercentage,
    strengths: matchedSkills,
    missingSkills,
    roadmap,
  };
};

module.exports = analyzeSkills;