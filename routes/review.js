const express = require("express");
const router = express.Router();
const Review = require("../models/Review");

router.post("/:hotelId", async (req, res) => {
  if (!req.session.user) return res.redirect("/login");

  await Review.create({
    hotelId: req.params.hotelId,
    userId: req.session.user._id,
    rating: req.body.rating,
    comment: req.body.comment
  });

  res.redirect("/hotels/" + req.params.hotelId);
});

module.exports = router;
