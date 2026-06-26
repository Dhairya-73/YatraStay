/**
 * Database model for saving user AI search history.
 * File: models/SearchHistory.js
 */

const mongoose = require("mongoose");

const searchHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  query: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for fast retrieval of latest queries for a specific user
searchHistorySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("SearchHistory", searchHistorySchema);
