/**
 * Unified client interface for Google Gemini with strict validation, latency tracing, and structured logging.
 * File: utils/llmClient.js
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");
const { extractedFiltersSchema, recommendationResponseSchema } = require("./validationSchemas");
const logger = require("./logger");

class LLMClient {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    this.genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
    this.modelName = process.env.AI_MODEL || "gemini-2.5-flash";
  }

  /**
   * Parse user search query into structured filters with retry, validation, and tracing.
   * @param {string} query 
   * @param {string} requestId Tracing Request ID
   * @returns {Promise<object>} Parsed filters conforming strictly to Joi schema
   */
  async extractFilters(query, requestId) {
    if (!this.genAI) {
      logger.warn(requestId, "Gemini Client not initialized due to missing API key. Returning fallback empty filters.");
      return this._getDefaultFilters();
    }

    const { systemPrompt, userPrompt } = require("../prompts/v1/extractFilters");
    
    // Set up model with structured configuration
    const model = this.genAI.getGenerativeModel({
      model: this.modelName,
      systemInstruction: systemPrompt,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1 // Low temperature for deterministic output
      }
    });

    let attempt = 0;
    const maxRetries = 1;

    while (attempt <= maxRetries) {
      const startTime = Date.now();
      try {
        logger.info(requestId, `Sending query to Gemini for filter extraction (Attempt ${attempt + 1}/${maxRetries + 1})...`);
        const result = await model.generateContent(userPrompt(query));
        const text = result.response.text();
        const latency = Date.now() - startTime;

        logger.info(requestId, "Received filter extraction response from Gemini.", {
          geminiLatencyMs: latency,
          attempt: attempt + 1
        });
        
        // 1. JSON Parsing Check
        const filters = JSON.parse(text);
        
        // 2. Joi validation
        const { error, value } = extractedFiltersSchema.validate(filters);
        if (error) {
          logger.warn(requestId, `Joi Validation failed for extracted filters: ${error.details[0].message}`, {
            rawResponse: text,
            validationError: error.details[0].message
          });
          throw new Error(`Filter validation failed: ${error.details[0].message}`);
        }

        return value;
      } catch (err) {
        const latency = Date.now() - startTime;
        logger.warn(requestId, `Filter extraction attempt ${attempt + 1} failed.`, {
          geminiLatencyMs: latency,
          errorMessage: err.message
        });
        attempt++;
      }
    }

    // Graceful fallback if retries are exhausted
    logger.error(requestId, "Exceeded retry limits or failed validation for filter extraction. Returning empty filters.");
    return this._getDefaultFilters();
  }

  /**
   * Generate RAG recommendations based on matching database listings with tracing and strict JSON validation.
   * @param {string} query 
   * @param {Array<object>} hotels 
   * @param {string} requestId Tracing Request ID
   * @returns {Promise<object>} Grounded, validated JSON recommendations
   */
  async generateRecommendation(query, hotels, requestId) {
    if (!this.genAI) {
      return this._getDefaultRecommendation(hotels, "AI Assistant is currently offline (API key missing). Please try our standard search.");
    }

    if (!hotels || hotels.length === 0) {
      return this._getDefaultRecommendation([], "No listings matched your criteria.");
    }

    const { systemPrompt, userPrompt } = require("../prompts/v1/recommendListings");

    // Configure model with structured configuration
    const model = this.genAI.getGenerativeModel({
      model: this.modelName,
      systemInstruction: systemPrompt,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.3, // Slightly higher temperature for descriptive text reasoning
        topP: 0.95,
        topK: 40
      }
    });

    let attempt = 0;
    const maxRetries = 1;

    while (attempt <= maxRetries) {
      const startTime = Date.now();
      try {
        logger.info(requestId, `Sending Grounded RAG request to Gemini for ${hotels.length} hotels (Attempt ${attempt + 1}/${maxRetries + 1})...`);
        const result = await model.generateContent(userPrompt(query, hotels));
        const text = result.response.text();
        const latency = Date.now() - startTime;

        logger.info(requestId, "Received Grounded RAG response from Gemini.", {
          geminiLatencyMs: latency,
          attempt: attempt + 1
        });

        // 1. JSON Parsing Check
        const parsed = JSON.parse(text);

        // 2. Joi Validation Schema Check
        const { error, value } = recommendationResponseSchema.validate(parsed);
        if (error) {
          logger.warn(requestId, `Joi Validation failed for RAG response: ${error.details[0].message}`);
          throw new Error(`RAG validation failed: ${error.details[0].message}`);
        }

        // 3. Grounding Verification: Ensure all returned listingIds exist in database candidates
        const validIds = new Set(hotels.map((h) => h._id.toString()));
        const verifiedRecs = value.recommendations.filter((rec) => {
          const isValid = validIds.has(rec.listingId.toString());
          if (!isValid) {
            logger.warn(requestId, `Filtered out hallucinated listingId from recommendations: "${rec.listingId}"`);
          }
          return isValid;
        });

        if (verifiedRecs.length === 0 && value.recommendations.length > 0) {
          throw new Error("All recommended listing IDs were hallucinated or invalid.");
        }

        return {
          recommendations: verifiedRecs,
          summary: value.summary
        };
      } catch (err) {
        const latency = Date.now() - startTime;
        logger.warn(requestId, `Grounded recommendation attempt ${attempt + 1} failed.`, {
          geminiLatencyMs: latency,
          errorMessage: err.message
        });
        attempt++;
      }
    }

    // Fallback if all attempts fail
    logger.error(requestId, "Exceeded retry limits or failed validation for grounded recommendations. Returning fallback details.");
    return this._getDefaultRecommendation(hotels, "I matched these properties to your criteria, but encountered an error generating the detailed recommendation layout:");
  }

  _getDefaultRecommendation(hotels, customSummary) {
    return {
      recommendations: hotels.map((hotel) => ({
        listingId: hotel._id.toString(),
        reason: "Matched based on location and price filters.",
        pros: ["Located in " + hotel.location, "Price: ₹" + hotel.price],
        cons: [],
        relevanceExplanation: `Relevance score: ${hotel.relevanceScore || 100}%`
      })),
      summary: customSummary
    };
  }

  _getDefaultFilters() {
    return {
      location: null,
      maxPrice: null,
      propertyType: null,
      guests: null,
      amenities: [],
      rating: null
    };
  }
}

module.exports = new LLMClient();
