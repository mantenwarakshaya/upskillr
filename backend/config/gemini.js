// backend/config/gemini.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

if (!process.env.GEMINI_API_KEY) {
  console.error("❌ CRITICAL ERROR: GEMINI_API_KEY is missing from your .env file.");
  process.exit(1);
}

// Initialize the Google Generative AI client instance
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Returns a configured model instance based on the requested string identifier
 * @param {string} modelName - e.g., 'gemini-2.5-flash'
 */
const getModel = (modelName = "gemini-2.5-flash") => {
  return genAI.getGenerativeModel({ model: modelName });
};

/**
 * Simple Exponential Backoff Retry Wrapper to prevent rate limit exceptions (429)
 */
const callWithRetry = async (apiCallFn, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await apiCallFn();
    } catch (error) {
      // If we hit a rate limit (429) or temporary server block, wait and retry
      if ((error.status === 429 || error.message?.includes("429")) && i < retries - 1) {
        console.warn(`⚠️ Gemini Rate Limited. Retrying in ${delay}ms... (Attempt ${i + 1}/${retries})`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Double the backoff duration
        continue;
      }
      throw error; // If it's a structural or credential error, fail immediately
    }
  }
};

module.exports = {
  genAI,
  getModel,
  callWithRetry
};