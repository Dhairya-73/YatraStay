/**
 * Controller for AI Travel Assistant endpoints with performance tracing, request IDs, and history tracking.
 * File: controllers/aiController.js
 */

const crypto = require("crypto");
const aiService = require("../services/aiService");
const SearchHistory = require("../models/SearchHistory");
const { sanitizeInput } = require("../utils/sanitizer");
const { chatRequestSchema } = require("../utils/validationSchemas");
const logger = require("../utils/logger");

/**
 * Render the main AI Assistant chat UI page
 */
exports.renderAssistantPage = async (req, res) => {
  try {
    let history = [];
    
    // Fetch latest 5 search history items for authenticated users
    if (req.session.user) {
      history = await SearchHistory.find({ userId: req.session.user._id })
        .sort({ createdAt: -1 })
        .limit(5);
    }
    
    res.render("ai-assistant", { history });
  } catch (err) {
    console.error("[aiController] Error rendering assistant page:", err);
    res.render("ai-assistant", { history: [] });
  }
};

/**
 * Handle POST request for natural language search queries with tracing, profiling, and history tracking
 */
exports.handleChatRequest = async (req, res) => {
  const requestId = crypto.randomUUID(); // Generate unique trace ID
  const totalStartTime = Date.now();

  try {
    logger.info(requestId, `Incoming AI search request: "${req.body.message}"`);

    // 1. Sanitize user input (removes HTML, overrides prompt injections)
    const sanitizedMessage = sanitizeInput(req.body.message);

    // 2. Validate request payload against Joi schema
    const { error, value } = chatRequestSchema.validate({ message: sanitizedMessage });
    if (error) {
      logger.warn(requestId, `Request payload rejected: ${error.details[0].message}`);
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    // 3. Run RAG search pipeline
    const result = await aiService.handleSearch(value.message, requestId);

    // 4. Save history for authenticated users
    if (req.session.user && result.listings.length > 0) {
      try {
        await SearchHistory.create({
          userId: req.session.user._id,
          query: value.message
        });
        logger.info(requestId, "AI search query saved to user history database.");
      } catch (historyErr) {
        logger.warn(requestId, "Failed to save AI search query to user history.", { error: historyErr.message });
      }
    }

    const totalDuration = Date.now() - totalStartTime;
    logger.info(requestId, `AI search request completed successfully.`, {
      totalDurationMs: totalDuration
    });

    return res.json({
      success: true,
      data: result,
      requestId // Return trace ID to the client
    });
  } catch (err) {
    const totalDuration = Date.now() - totalStartTime;
    logger.error(requestId, "Error handling search request inside controller.", err, {
      totalDurationMs: totalDuration
    });

    // Provide a graceful fallback error response
    return res.status(500).json({
      success: false,
      error: "The AI assistant is experiencing temporary difficulties. Please try again later or use manual filters."
    });
  }
};
