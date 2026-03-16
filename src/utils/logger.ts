import { createLogger, format, transports } from "winston";

const { combine, timestamp, printf, colorize, errors, json } = format;

// Custom log format for console
const consoleFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

const logger = createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    json()
  ),
  transports: [
    // Console
    new transports.Console({
      format: combine(colorize(), consoleFormat)
    }),

    // Error log file
    new transports.File({
      filename: "logs/error.log",
      level: "error"
    }),

    // All logs
    new transports.File({
      filename: "logs/combined.log"
    })
  ]
});

export default logger;
