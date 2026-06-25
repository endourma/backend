const { createLogger, format, transports } = require("winston");
const path = require("path");

// Format personnalisé
const logFormat = format.printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level.toUpperCase()}] ${message}`;
});

// Logger principal
const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    logFormat
  ),
  transports: [
    // Console pour le dev
    new transports.Console({
      format: format.combine(format.colorize(), format.simple())
    }),

    // Fichier pour la prod
    new transports.File({
      filename: path.join(__dirname, "../logs/app.log"),
      level: "info"
    })
  ],
});

module.exports = logger;