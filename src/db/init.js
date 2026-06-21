import bcrypt from "bcryptjs";
import { query, getMode } from "./pool.js";
import config from "../config.js";

const PG_SCHEMA = `
  CREATE TABLE IF NOT EXISTS admins (
    id          SERIAL PRIMARY KEY,
    email       TEXT NOT NULL UNIQUE,
    password    TEXT NOT NULL,
    name        TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
  );
  CREATE TABLE IF NOT EXISTS contacts (
    id          SERIAL PRIMARY KEY,
    name        TEXT NOT NULL,
    email       TEXT NOT NULL,
    phone       TEXT,
    subject     TEXT,
    message     TEXT NOT NULL,
    is_read     BOOLEAN NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
  );
  CREATE TABLE IF NOT EXISTS leads (
    id          SERIAL PRIMARY KEY,
    name        TEXT NOT NULL,
    email       TEXT NOT NULL,
    phone       TEXT,
    company     TEXT,
    service     TEXT,
    budget      TEXT,
    message     TEXT,
    status      TEXT NOT NULL DEFAULT 'new',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
  );
  CREATE TABLE IF NOT EXISTS newsletter (
    id          SERIAL PRIMARY KEY,
    email       TEXT NOT NULL UNIQUE,
    active      BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
  );
  CREATE TABLE IF NOT EXISTS content (
    id          SERIAL PRIMARY KEY,
    section     TEXT NOT NULL UNIQUE,
    key         TEXT NOT NULL,
    value       TEXT NOT NULL DEFAULT '',
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
  );
`;

const SQLITE_SCHEMA = `
  CREATE TABLE IF NOT EXISTS admins (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    email       TEXT NOT NULL UNIQUE,
    password    TEXT NOT NULL,
    name        TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS contacts (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    email       TEXT NOT NULL,
    phone       TEXT,
    subject     TEXT,
    message     TEXT NOT NULL,
    is_read     INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS leads (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    email       TEXT NOT NULL,
    phone       TEXT,
    company     TEXT,
    service     TEXT,
    budget      TEXT,
    message     TEXT,
    status      TEXT NOT NULL DEFAULT 'new',
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS newsletter (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    email       TEXT NOT NULL UNIQUE,
    active      INTEGER NOT NULL DEFAULT 1,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS content (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    section     TEXT NOT NULL UNIQUE,
    key         TEXT NOT NULL,
    value       TEXT NOT NULL DEFAULT '',
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );
`;

/**
 * Create all tables if they don't exist and seed a default admin.
 */
export async function initDb() {
  const schema = getMode() === "postgres" ? PG_SCHEMA : SQLITE_SCHEMA;

  // Run each statement separately (both drivers handle multi-statement exec differently)
  for (const stmt of schema.split(";").map((s) => s.trim()).filter(Boolean)) {
    await query(stmt);
  }

  // Seed default admin if none exists
  const { rows } = await query("SELECT id FROM admins LIMIT 1");
  if (rows.length === 0) {
    const hashed = bcrypt.hashSync(config.adminPassword, 10);
    await query(
      "INSERT INTO admins (email, password, name) VALUES ($1, $2, $3)",
      [config.adminEmail, hashed, "Administrator"]
    );
    console.log(`👤 Default admin → ${config.adminEmail} / ${config.adminPassword}`);
    console.log("   ⚠️  Change this password after first login!");
  }

  console.log("✅ Database initialized");
}

const isDirectRun = process.argv[1]?.endsWith("db/init.js");
if (isDirectRun) {
  initDb()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

export default initDb;
