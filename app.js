require("dotenv").config();
const { validateConfig } = require("./utils/configValidator");
validateConfig(); // Ensure fail-fast behavior on missing environment keys

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");

const app = express();

// Set view engine
app.set('view engine', 'ejs');

/* ================= MIDDLEWARE ================= */
app.use(express.json()); // Support JSON-encoded request bodies (for AJAX chat queries)
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(
  session({
    secret: "yatrastay_secret",
    resave: false,
    saveUninitialized: false
  })
);

// Make logged-in user available in all EJS files
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

/* ================= ROUTES ================= */
app.use("/", require("./routes/home"));
app.use("/hotels", require("./routes/hotels"));
app.use("/booking", require("./routes/booking"));
app.use("/payment", require("./routes/payment"));
app.use("/", require("./routes/auth"));
app.use("/admin", require("./routes/admin"));
app.use("/reviews", require("./routes/review"));
app.use("/ai-assistant", require("./routes/aiRoutes"));

/* ================= DATABASE ================= */
const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/yatrastay";
mongoose
  .connect(MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

/* ================= SERVER ================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`YatraStay running on port ${PORT}`);
});

module.exports = app;
