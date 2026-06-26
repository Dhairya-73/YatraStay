/**
 * Rate Limiter middleware to protect LLM endpoints from abuse and control API costs.
 * File: middlewares/rateLimiter.js
 */

const rateLimit = require("express-rate-limit");

const aiChatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 15, // Limit each IP to 15 search queries per 15 minutes
  message: {
    status: 429,
    message: "Too many AI assistant requests from this IP. Please try again in 15 minutes."
  },
  standardHeaders: true, // Return rate limit info in standard headers
  legacyHeaders: false, // Disable obsolete X-RateLimit-* headers
});

module.exports = {
  aiChatLimiter
};
