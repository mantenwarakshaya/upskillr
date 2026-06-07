const axios = require("axios");

const searchJobs = async (targetRole, location = "India") => {
  try {
    const response = await axios.get(
      "https://jsearch.p.rapidapi.com/search",
      {
        headers: {
          "x-rapidapi-key": process.env.RAPIDAI_API_KEY,
          "x-rapidapi-host": "jsearch.p.rapidapi.com",
        },
        params: {
          query: `${targetRole} in ${location}`,
          page: "1",
          country: "in",
          employment_types: "INTERN,FULLTIME",
          job_requirements:
            "no_experience,under_3_years_experience",
        },
      }
    );

    const jobs = response.data.data || [];

    return jobs.slice(0, 10).map((job) => ({
      title: job.job_title,
      company: job.employer_name,
      location: job.job_city,
      applyLink: job.job_apply_link,
    }));
  } catch (err) {
    console.error("Job Search Error:", err.message);
    return [];
  }
};

module.exports = searchJobs;