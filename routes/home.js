const express = require("express");
const router = express.Router();
const Hotel = require("../models/Hotel");

router.get("/", async (req, res) => {
  const hotels = await Hotel.find().limit(6);
  res.render("home", { hotels });
});

module.exports = router;
