/**
 * Validation schemas using the Joi library.
 * File: utils/validationSchemas.js
 */

const Joi = require("joi");

/**
 * Validates the request body payload sent from EJS frontend client
 */
const chatRequestSchema = Joi.object({
  message: Joi.string()
    .trim()
    .required()
    .max(250)
    .messages({
      "string.empty": "Search query cannot be empty.",
      "any.required": "Search message is required.",
      "string.max": "Query cannot exceed 250 characters."
    })
});

/**
 * Validates the extracted filter JSON returned from Gemini AI
 */
const extractedFiltersSchema = Joi.object({
  location: Joi.string()
    .allow(null)
    .max(100)
    .default(null),
    
  maxPrice: Joi.number()
    .integer()
    .min(0)
    .allow(null)
    .default(null),
    
  propertyType: Joi.string()
    .allow(null)
    .max(50)
    .default(null),
    
  guests: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .allow(null)
    .default(null),
    
  amenities: Joi.array()
    .items(Joi.string().max(50))
    .default([]),
    
  rating: Joi.number()
    .min(1)
    .max(5)
    .allow(null)
    .default(null)
})
.unknown(false); // Reject any unknown fields completely to prevent operator injections

/**
 * Joi Schema for validating individual hotel recommendation objects
 */
const recommendationItemSchema = Joi.object({
  listingId: Joi.string().required(),
  reason: Joi.string().required().max(500),
  pros: Joi.array().items(Joi.string().max(100)).default([]),
  cons: Joi.array().items(Joi.string().max(100)).default([]),
  relevanceExplanation: Joi.string().required().max(500)
});

/**
 * Joi Schema for validating the entire structured JSON recommendation response
 */
const recommendationResponseSchema = Joi.object({
  recommendations: Joi.array().items(recommendationItemSchema).required(),
  summary: Joi.string().required().max(500)
})
.unknown(false);

module.exports = {
  chatRequestSchema,
  extractedFiltersSchema,
  recommendationItemSchema,
  recommendationResponseSchema
};
