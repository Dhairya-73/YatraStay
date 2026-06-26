/**
 * Routes for the AI Travel Assistant.
 * File: routes/aiRoutes.js
 */

const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");
const { aiChatLimiter } = require("../middlewares/rateLimiter");

// Render the AI Assistant Page
router.get("/", aiController.renderAssistantPage);

// API Chat search endpoint (protected by Rate Limiter)
router.post("/chat", aiChatLimiter, aiController.handleChatRequest);

module.exports = router;
