const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 100, // 1 minute
  max: 10,
  message: "Too many requests, please try again later.",
});

module.exports = { apiLimiter };
