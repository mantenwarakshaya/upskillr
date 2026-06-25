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
const getModel = (modelName = "gemini-2.0-flash") => {
  return genAI.getGenerativeModel({ model: modelName });
};

/**
 * Simple Exponential Backoff Retry Wrapper to prevent rate limit exceptions (429)
 */
const callWithRetry = async (
  apiCallFn,
  retries = 5,
  delay = 1000
) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await apiCallFn();
    } catch (error) {
      const isRetryable =
        error.status === 429 ||
        error.status === 503 ||
        error.message?.includes("429") ||
        error.message?.includes("503");

      if (isRetryable && i < retries - 1) {
        console.warn(
          `⚠️ Gemini unavailable. Retrying in ${delay}ms...`
        );

        await new Promise((resolve) =>
          setTimeout(resolve, delay)
        );

        delay *= 2;
        continue;
      }

      throw error;
    }
  }
};

module.exports = {
  genAI,
  getModel,
  callWithRetry
};