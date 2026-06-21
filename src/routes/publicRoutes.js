import { Router } from "express";
import { submitContact, submitLead, subscribeNewsletter } from "../controllers/publicController.js";

// Rate limiting for public forms (basic in-memory limiter)
const attempts = new Map();
function formLimiter(req, res, next) {
  const ip = req.ip;
  const now = Date.now();
  const windowMs = 60_000; // 1 minute
  const max = 5;
  const entry = attempts.get(ip) || [];
  const recent = entry.filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    return res.status(429).json({ error: "Too many submissions. Please wait a minute." });
  }
  recent.push(now);
  attempts.set(ip, recent);
  next();
}

const router = Router();

// These are called by your Surge frontend — public, no auth
router.post("/contact", formLimiter, submitContact);
router.post("/lead", formLimiter, submitLead);
router.post("/newsletter", formLimiter, subscribeNewsletter);

export default router;
