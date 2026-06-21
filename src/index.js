import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { fileURLToPath } from "url";
import path from "path";
import config from "./config.js";
import { initDb } from "./db/init.js";

import publicRoutes from "./routes/publicRoutes.js";
import contentRoutes from "./routes/contentRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function start() {
  await initDb();

  const app = express();

  app.use(helmet({ contentSecurityPolicy: false })); // dashboard uses inline styles
  app.use(
    cors({
      origin: config.corsOrigin === "*" ? true : config.corsOrigin.split(","),
    })
  );
  app.use(express.json());
  app.use(morgan(config.nodeEnv === "production" ? "combined" : "dev"));

  // Serve the admin dashboard (static files)
  const publicPath = path.join(__dirname, '../public');
  console.log("Serving static files from:", publicPath);
  
  // Verify public folder exists on startup
  try {
    const fs = await import('fs');
    fs.accessSync(publicPath);
    console.log("✓ Public folder found and accessible");
  } catch (err) {
    console.warn("⚠ Public folder not found at:", publicPath);
    console.warn("  Static files will not be served. Create the folder and add files.");
  }
  
  app.use(express.static(publicPath));

  // Health check
  app.get("/health", (req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

  // API routes
  app.use("/api/public", publicRoutes);
  app.use("/api/content", contentRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/admin", adminRoutes);

  // Fallback to dashboard for non-API routes (SPA-ish)
  app.get(/^\/(?!api|health).*/, (req, res, next) => {
    const indexPath = path.join(publicPath, "index.html");
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error("Error serving index.html:", err.message);
        console.error("Attempted path:", indexPath);
        // If index.html not found, return simple fallback
        if (err.code === 'ENOENT') {
          res.status(404).json({ 
            error: "Dashboard not found", 
            hint: "Ensure public/index.html exists",
            path: indexPath 
          });
        } else {
          next(err);
        }
      }
    });
  });

  app.use(notFound);
  app.use(errorHandler);

  app.listen(config.port, () => {
    console.log(`\n🚀 Backend + Dashboard running at http://localhost:${config.port}`);
    console.log(`   Dashboard:  http://localhost:${config.port}/`);
    console.log(`   API:        http://localhost:${config.port}/api/`);
    console.log(`   Site:       ${config.siteName}\n`);
  });
}

start().catch((err) => {
  console.error("Failed to start:", err);
  process.exit(1);
});

export default start;
