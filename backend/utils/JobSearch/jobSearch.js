// backend/utils/JobSearch/jobSearch.js
const axios = require("axios");

const searchJobs = async (targetRole, location = "India") => {
  if (!process.env.RAPIDAI_API_KEY) {
    console.error("⚠️ RAPIDAI_API_KEY is not configured in your environment variables.");
    return [];
  }

  try {
    const response = await axios.get("https://jsearch.p.rapidapi.com/search", {
      headers: {
        "x-rapidapi-key": process.env.RAPIDAI_API_KEY,
        "x-rapidapi-host": "jsearch.p.rapidapi.com",
      },
      params: {
        query: `${targetRole} in ${location}`,
        page: "1",
        country: "in",
        employment_types: "INTERN,FULLTIME",
        job_requirements: "no_experience,under_3_years_experience", // Targets freshers and junior talent
      },
    });

    const jobs = response.data.data || [];

    // Map out only what the frontend dashboard cards actually need to render cleanly
    return jobs.slice(0, 10).map((job) => ({
      title: job.job_title,
      company: job.employer_name,
      location: job.job_city || job.job_country || "Remote / India",
      applyLink: job.job_apply_link,
    }));
  } catch (err) {
    console.error("❌ JSearch API Engine Failure:", err.message);
    return [];
  }
};

module.exports = searchJobs;