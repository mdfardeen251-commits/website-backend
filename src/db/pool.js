import pg from "pg";
import Database from "better-sqlite3";
import { mkdirSync } from "fs";
import config from "../config.js";

/**
 * Unified query interface.
 *
 * - If DATABASE_URL is set → uses PostgreSQL (production / Supabase / Neon)
 * - Otherwise → uses a local SQLite file (zero-setup development)
 *
 * Models call query(text, params) with $1, $2 placeholders and read .rows,
 * so they work identically on both backends.
 */

let mode;
let pool;
let sqlite;

if (config.databaseUrl) {
  // ── PostgreSQL ──
  mode = "postgres";
  const { Pool } = pg;
  pool = new Pool({
    connectionString: config.databaseUrl,
    ssl:
      config.nodeEnv === "production" ||
      config.databaseUrl.includes("supabase") ||
      config.databaseUrl.includes("neon")
        ? { rejectUnauthorized: false }
        : false,
    max: 10,
    idleTimeoutMillis: 30000,
  });
  pool.on("error", (err) => console.error("Unexpected database error:", err));
  console.log("🐘 Database: PostgreSQL");
} else {
  // ── SQLite (local dev) ──
  mode = "sqlite";
  mkdirSync("./data", { recursive: true });
  sqlite = new Database("./data/dev.db");
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  console.log("📦 Database: SQLite (local dev — set DATABASE_URL for production)");
}

/**
 * Run a parameterized query using $1, $2, ... placeholders.
 * Returns { rows } on both backends.
 */
export function query(text, params = []) {
  if (mode === "postgres") {
    return pool.query(text, params); // async
  }

  // SQLite: expand $N placeholders (supporting reuse), convert now(), coerce booleans
  const expanded = [];
  let sql = text.replace(/\$(\d+)/g, (_, num) => {
    const val = params[parseInt(num, 10) - 1];
    expanded.push(typeof val === "boolean" ? (val ? 1 : 0) : val);
    return "?";
  });
  sql = sql.replace(/\bnow\(\)/gi, "datetime('now')");
  const upper = sql.trim().toUpperCase();
  const hasReturning = upper.includes("RETURNING");
  const isRead = upper.startsWith("SELECT") || upper.startsWith("WITH") || upper.startsWith("PRAGMA");

  const stmt = sqlite.prepare(sql);
  if (isRead || hasReturning) {
    const rows = stmt.all(...expanded);
    return Promise.resolve({ rows });
  }
  const result = stmt.run(...expanded);
  return Promise.resolve({ rows: [], rowCount: result.changes });
}

export function getMode() {
  return mode;
}

export default { query, getMode };
