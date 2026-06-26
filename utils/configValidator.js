/**
 * Startup environment configuration validator.
 * File: utils/configValidator.js
 */

const logger = require("./logger");

/**
 * Validate that all required configuration variables are present
 * Halts server startup if required keys are missing.
 */
function validateConfig() {
  const requiredKeys = ["GEMINI_API_KEY"];
  const missing = [];

  for (const key of requiredKeys) {
    if (!process.env[key] || process.env[key].trim() === "") {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    const errorMessage = `CRITICAL CONFIGURATION ERROR: Missing required keys: [ ${missing.join(", ")} ] in environment variables (.env).`;
    
    logger.error(null, errorMessage);
    
    // Output prominent error message box in terminal
    console.error("\n" + "*".repeat(80));
    console.error(`* ${errorMessage}`);
    console.error("* Please configure this key in your .env file and restart the server.");
    console.error("*".repeat(80) + "\n");
    
    process.exit(1); // Fail-fast and prevent Express from starting
  }

  logger.info(null, "Environment configuration verified successfully.");
}

module.exports = {
  validateConfig
};
