import jwt from "jsonwebtoken";
import config from "../config.js";

/**
 * Verifies the JWT from Authorization header OR cookie.
 */
export function authenticate(req, res, next) {
  let token = null;

  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) {
    token = header.split(" ")[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    req.user = jwt.verify(token, config.jwtSecret);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export default authenticate;
