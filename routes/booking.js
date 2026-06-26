const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");

/* Create booking */
router.post("/:hotelId", async (req, res) => {
  if (!req.session.user) return res.redirect("/login");

  const booking = await Booking.create({
    hotelId: req.params.hotelId,
    userId: req.session.user._id,
    checkin: req.body.checkin,
    checkout: req.body.checkout
  });

  res.redirect(`/payment/${booking._id}`);
});

/* My bookings */
router.get("/my-bookings", async (req, res) => {
  if (!req.session.user) return res.redirect("/login");

  let bookings = await Booking.find({ userId: req.session.user._id })
    .populate("hotelId");

  // Filter out bookings where the referenced hotel has been deleted
  bookings = bookings.filter(b => b.hotelId !== null);

  res.render("my-bookings", { bookings });
});

/* Booking success */
router.get("/success", (req, res) => {
  res.render("booking-success");
});

module.exports = router;
