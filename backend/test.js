const analyzeSkills = require("./utils/skillAnalyzer");

const result = analyzeSkills(
  "AI Engineer",
  ["Python", "Machine Learning", "React"]
);

console.log(result);