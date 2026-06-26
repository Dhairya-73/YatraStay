const express = require("express");
const router = express.Router();
const Hotel = require("../models/Hotel");
const isAdmin = require("../middleware/isAdmin");
const multer = require("multer");
const { storage } = require("../cloudConfig");

const upload = multer({ storage });

router.get("/add-hotel", isAdmin, (req, res) => {
  res.render("admin-add-hotel");
});

router.post("/add-hotel", isAdmin, upload.single("image"), async (req, res) => {
  let imagePath = "";
  if (req.file) {
    imagePath = req.file.path;
  } else if (req.body.imageUrl) {
    imagePath = req.body.imageUrl.trim();
  }

  await Hotel.create({
    ...req.body,
    image: imagePath
  });
  res.redirect("/");
});

module.exports = router;
