const express = require("express");
require('@dotenvx/dotenvx').config()
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const cookieParser = require("cookie-parser");

const { apiLimiter } = require("./config/rateLimit");
const logger = require("./config/logger");
require("./config/db");

const authRoutes = require("./routes/auth");
const videoRoutes = require("./routes/video");

const app = express();
const port = process.env.PORT || 5000;

// Middlewares globaux
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

// CORS (important si frontend ≠ backend)
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Morgan branché sur Winston
if (process.env.NODE_ENV === "production") {
  // En prod → logs HTTP dans un fichier
  const accessLogStream = fs.createWriteStream(
    path.join(__dirname, "logs/access.log"),
    { flags: "a" }
  );
  app.use(morgan("combined", { stream: accessLogStream }));
} else {
  // En dev → logs colorés dans la console
  app.use(morgan("dev"));
}

app.use(apiLimiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/videos", videoRoutes);

// Test route
app.get("/", (req, res) => {
  logger.info("Route test '/' appelée");
  res.send("Backend API is running!");
});

// Middleware d’erreur générique
app.use((err, req, res, next) => {
  logger.error(err.message);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Erreur serveur" });
});

// Démarrage serveur
app.listen(port, () => {
  logger.info(`Backend started on port ${port}`);
});