const axios = require("axios");

const searchRoleDemand = async (targetRole) => {
  try {
    const response = await axios.post(
      "https://api.tavily.com/search",
      {
        api_key: process.env.TAVILY_API_KEY,
        query: `
          Current demand for ${targetRole} jobs in India,
          salary trends,
          hiring trends,
          future outlook,
          top companies hiring
          `,
        search_depth: "advanced",
        max_results: 5,
      }
    );

    return response.data.results || [];
  } catch (err) {
    console.error("Tavily Error:", err.message);
    return [];
  }
};

module.exports = searchRoleDemand;