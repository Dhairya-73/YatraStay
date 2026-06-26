const express = require("express");
const router = express.Router();
const Hotel = require("../models/Hotel");
const Review = require("../models/Review");

/* Search + Listing */
router.get("/search", async (req, res) => {
  const { location, sort } = req.query;
  let query = {};

  if (location) {
    query.location = { $regex: location, $options: "i" };
  }

  let hotels = Hotel.find(query);

  if (sort === "priceLow") hotels = hotels.sort({ price: 1 });
  if (sort === "priceHigh") hotels = hotels.sort({ price: -1 });

  // Fetch all hotels to drive the dynamic "Continue Exploring" recommendation block
  const allHotels = await Hotel.find({});

  res.render("hotel-list", { 
    hotels: await hotels, 
    allHotels, 
    query: req.query 
  });
});

/* Details */
router.get("/:id", async (req, res) => {
  const hotel = await Hotel.findById(req.params.id);
  const reviews = await Review.find({ hotelId: hotel._id }).populate("userId");

  // Query up to 3 similar stays in the same general location, falling back to other locations if pool is small
  const locWord = hotel.location ? hotel.location.split(',')[0].trim() : "";
  let similarStays = await Hotel.find({
    _id: { $ne: hotel._id },
    location: { $regex: locWord, $options: "i" }
  }).limit(3);

  if (similarStays.length < 3) {
    const additional = await Hotel.find({
      _id: { $ne: hotel._id, $nin: similarStays.map(s => s._id) }
    }).limit(3 - similarStays.length);
    similarStays = [...similarStays, ...additional];
  }

  res.render("hotel-details", { hotel, reviews, similarStays });
});

module.exports = router;
