import pino from "pino";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  base: {
    instance: process.env.SCHOOL_NAME || "unknown", // e.g., "mammolshain"
    env: process.env.NODE_ENV,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label }),
  },
});

// Business event logger (for rentals, book ops, etc.)
export const businessLogger = logger.child({ category: "business" });

// Error logger
export const errorLogger = logger.child({ category: "error" });

// API request logger
export const apiLogger = logger.child({ category: "api" });

// Auth logger
export const authLogger = logger.child({ category: "auth" });

export default logger;
