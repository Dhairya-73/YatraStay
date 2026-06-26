const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");

router.get("/:bookingId", async (req, res) => {
  const booking = await Booking.findById(req.params.bookingId).populate("hotelId");
  if (!booking || !booking.hotelId) {
    return res.redirect("/");
  }
  res.render("payment", { booking });
});

router.post("/success/:bookingId", async (req, res) => {
  await Booking.findByIdAndUpdate(req.params.bookingId, {
    paymentStatus: "paid"
  });

  res.redirect("/booking/success");
});

module.exports = router;
