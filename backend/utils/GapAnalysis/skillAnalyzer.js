const roles = require("../../data/roles");

const analyzeSkills = (targetRole, userSkills) => {
  // 1. Get required skills for target role safely
  const requiredSkills = roles[targetRole];

  // Fix: If role is not found, immediately exit gracefully instead of running .filter()
  if (!requiredSkills || !Array.isArray(requiredSkills)) {
    return {
      error: `Target role '${targetRole}' was not found or is misconfigured in database.`,
    };
  }

  const normalizedUserSkills = userSkills.map(skill => skill.toLowerCase());

  const matchedSkills = requiredSkills.filter(skill =>
    normalizedUserSkills.includes(skill.toLowerCase())
  );

  const missingSkills = requiredSkills.filter(
    skill => !normalizedUserSkills.includes(skill.toLowerCase())
  );

  const matchPercentage = requiredSkills.length > 0 
    ? Math.round((matchedSkills.length / requiredSkills.length) * 100) 
    : 0;

  const roadmap = [...missingSkills];

  return {
    matchPercentage,
    strengths: matchedSkills,
    missingSkills,
    roadmap,
  };
};

module.exports = analyzeSkills;