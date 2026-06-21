import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development",

  // PostgreSQL connection (use Supabase / Neon / Render Postgres)
  databaseUrl: process.env.DATABASE_URL,

  // JWT
  jwtSecret: process.env.JWT_SECRET || "dev-secret-change-me-in-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",

  // CORS — your Surge frontend domain(s), comma-separated
  corsOrigin: process.env.CORS_ORIGIN || "*",

  // Default admin (created on first run if no admin exists)
  adminEmail: process.env.ADMIN_EMAIL || "admin@example.com",
  adminPassword: process.env.ADMIN_PASSWORD || "admin123",

  // Public site name (shown in dashboard)
  siteName: process.env.SITE_NAME || "My Website",
};

export default config;
