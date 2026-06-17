// backend/utils/JobSearch/tavilySearch.js
const axios = require("axios");

const searchRoleDemand = async (targetRole) => {
  if (!process.env.TAVILY_API_KEY) {
    console.error("⚠️ TAVILY_API_KEY is missing from environment parameters.");
    return [];
  }

  try {
    const response = await axios.post("https://api.tavily.com/search", {
      api_key: process.env.TAVILY_API_KEY,
      query: `Current hiring trends, industry demand level, market salary projections, and top domestic employers recruiting for ${targetRole} roles in India for 2026.`,
      search_depth: "advanced",
      max_results: 5,
    });

    return response.data.results || [];
  } catch (err) {
    console.error("❌ Tavily Search Discovery Failure:", err.message);
    return [];
  }
};

module.exports = searchRoleDemand;