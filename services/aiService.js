/**
 * AI Service coordinating filter extraction, DB querying, and grounded recommendations.
 * File: services/aiService.js
 */

const Hotel = require("../models/Hotel");
const llmClient = require("../utils/llmClient");
const queryBuilder = require("../utils/queryBuilder");
const logger = require("../utils/logger");

class AIService {
  /**
   * Main orchestrator for natural language property search (Grounded Retrieval)
   * @param {string} query User search string
   * @param {string} requestId Request ID for tracing
   * @returns {Promise<object>} matching listings and AI recommendations
   */
  async handleSearch(query, requestId) {
    if (!query || typeof query !== "string" || !query.trim()) {
      throw new Error("Search query cannot be empty.");
    }

    // 1. Extract filters from natural language using Gemini
    const filters = await llmClient.extractFilters(query, requestId);

    // 2. Build MongoDB query using the dedicated QueryBuilder
    const dbQuery = queryBuilder.buildQuery(filters);

    // 3. Query MongoDB for top matching candidates
    const startTime = Date.now();
    logger.info(requestId, "Executing MongoDB query for coarse filtering...", { mongoQuery: dbQuery });

    let matchedHotels = [];
    let queryWasRelaxed = false;

    try {
      matchedHotels = await Hotel.find(dbQuery)
        .select("name location price description image")
        .limit(5);

      const dbLatency = Date.now() - startTime;
      logger.info(requestId, `MongoDB query complete. Found ${matchedHotels.length} exact matches.`, {
        mongoLatencyMs: dbLatency
      });

      // 4. Relaxed Query Fallback if 0 results matched
      if (matchedHotels.length === 0) {
        logger.info(requestId, "Zero exact matches found in MongoDB. Attempting query relaxation fallback...");
        const relaxedQuery = queryBuilder.buildRelaxedQuery(filters);
        
        // Execute relaxed query if location was specified (otherwise relax has no meaning)
        if (relaxedQuery && Object.keys(relaxedQuery).length > 0) {
          const relaxedStartTime = Date.now();
          matchedHotels = await Hotel.find(relaxedQuery)
            .select("name location price description image")
            .limit(5);
          
          const relaxedLatency = Date.now() - relaxedStartTime;
          queryWasRelaxed = true;
          logger.info(requestId, `MongoDB relaxed query complete. Found ${matchedHotels.length} alternative matches.`, {
            mongoLatencyMs: relaxedLatency,
            relaxedQuery
          });
        }
      }
    } catch (dbErr) {
      const dbLatency = Date.now() - startTime;
      logger.error(requestId, "MongoDB query failed inside AIService.", dbErr, {
        mongoLatencyMs: dbLatency
      });
      throw new Error("Database query failed during property search.");
    }

    // 5. Score and Sort matching candidate listings in memory
    let scoredHotels = [];
    if (matchedHotels.length > 0) {
      scoredHotels = matchedHotels.map(hotel => {
        const score = this._calculateRelevanceScore(hotel, filters);
        return {
          ...hotel.toObject(),
          relevanceScore: score
        };
      });

      // Sort by relevance score descending
      scoredHotels.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }

    // 6. Grounded RAG: Generate analysis and rankings if hotels found
    let recommendation = "";
    if (scoredHotels.length > 0) {
      // Modify user prompt text slightly if we are presenting alternative matches
      const refinedQuery = queryWasRelaxed 
        ? `${query} (Note: No exact matches were found for your constraints. Suggest these alternatives instead, explaining clearly why they are slightly outside the constraints.)`
        : query;

      recommendation = await llmClient.generateRecommendation(refinedQuery, scoredHotels, requestId);
    } else {
      logger.info(requestId, "No candidate hotels retrieved. Skipping LLM RAG recommendation step.");
      recommendation = "I couldn't find any hotels in our system matching your criteria. Try adjusting your destination or widening your budget limits.";
    }

    return {
      filters,
      listings: scoredHotels,
      recommendation,
      queryWasRelaxed
    };
  }

  /**
   * Helper to calculate a relevance score from 0 to 100 based on filters match
   * @param {object} hotel Mongoose Hotel document
   * @param {object} filters Validated filters
   * @returns {number} Score out of 100
   */
  _calculateRelevanceScore(hotel, filters) {
    let score = 0;

    // 1. Location match (max 50 pts)
    if (filters.location && hotel.location) {
      const hl = hotel.location.toLowerCase();
      const fl = filters.location.toLowerCase();
      if (hl.includes(fl)) {
        score += 50;
      }
    } else {
      score += 50; // Neutral if location was not requested
    }

    // 2. Price match (max 30 pts)
    if (filters.maxPrice && hotel.price) {
      if (hotel.price <= filters.maxPrice) {
        score += 30;
      } else {
        // Deduct points if over budget (1% over = 1 pt off, up to 30 pts)
        const diffPercent = (hotel.price - filters.maxPrice) / filters.maxPrice;
        const deduction = Math.min(30, Math.floor(diffPercent * 100));
        score += Math.max(0, 30 - deduction);
      }
    } else {
      score += 30; // Neutral if price was not requested
    }

    // 3. Keyword / Amenity matches (max 20 pts)
    if (filters.amenities && filters.amenities.length > 0) {
      const desc = (hotel.description || "").toLowerCase();
      const name = (hotel.name || "").toLowerCase();
      let matchedCount = 0;
      
      filters.amenities.forEach(amenity => {
        const am = amenity.toLowerCase();
        if (desc.includes(am) || name.includes(am)) {
          matchedCount++;
        }
      });

      const matchRatio = matchedCount / filters.amenities.length;
      score += Math.floor(matchRatio * 20);
    } else {
      score += 20; // Neutral if no amenities requested
    }

    return score;
  }
}

module.exports = new AIService();
