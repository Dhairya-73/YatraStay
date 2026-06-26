/**
 * Utility for translating Joi-validated filters into MongoDB/Mongoose query objects.
 * File: utils/queryBuilder.js
 */

class QueryBuilder {
  /**
   * Translate filters into the primary strict database query
   * @param {object} filters Validated filter object from Joi
   * @returns {object} Mongoose filter object
   */
  buildQuery(filters) {
    const dbQuery = {};

    // 1. Safe regex match on location (case-insensitive substring)
    if (filters.location && typeof filters.location === "string") {
      dbQuery.location = { $regex: this._escapeRegex(filters.location), $options: "i" };
    }

    // 2. Maximum price constraint
    if (filters.maxPrice && typeof filters.maxPrice === "number" && !isNaN(filters.maxPrice)) {
      dbQuery.price = { $lte: filters.maxPrice };
    }

    return dbQuery;
  }

  /**
   * Build a relaxed fallback query (e.g. ignoring price budget if exact search fails)
   * @param {object} filters Validated filter object from Joi
   * @returns {object} Mongoose filter object
   */
  buildRelaxedQuery(filters) {
    const dbQuery = {};

    // Relax price constraint to find properties in the same location
    if (filters.location && typeof filters.location === "string") {
      dbQuery.location = { $regex: this._escapeRegex(filters.location), $options: "i" };
    }

    return dbQuery;
  }

  /**
   * Escape special characters in regex string to prevent regex injection attacks
   * @param {string} string
   * @returns {string} Escaped string
   */
  _escapeRegex(string) {
    return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
  }
}

module.exports = new QueryBuilder();
