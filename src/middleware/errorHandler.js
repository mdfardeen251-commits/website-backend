import config from "../config.js";

export function notFound(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
}

export function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.name === "ZodError") {
    return res.status(400).json({
      error: "Validation failed",
      details: err.errors,
    });
  }

  const status = err.status || 500;
  const message = err.message || "Internal server error";

  res.status(status).json({
    error: message,
    ...(config.nodeEnv === "development" && { stack: err.stack }),
  });
}

export default errorHandler;
