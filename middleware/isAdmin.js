module.exports = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in to access this page");
    return res.redirect("/login");
  }
  if (req.user.role !== "admin") {
    req.flash("error", "You do not have permission to access this page");
    return res.redirect("/");
  }
  next();
};
