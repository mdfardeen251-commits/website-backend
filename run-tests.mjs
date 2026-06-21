// End-to-end test runner — spawns the server (SQLite dev mode) and tests all endpoints.
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const BASE = "http://localhost:3000";
let passed = 0;
let failed = 0;
let token = null;
let server = null;

async function req(method, path, body, tok) {
  const headers = { "Content-Type": "application/json" };
  if (tok) headers.Authorization = `Bearer ${tok}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

function assert(name, cond, detail = "") {
  if (cond) { passed++; console.log(`  ✅ ${name}`); }
  else { failed++; console.log(`  ❌ ${name} ${detail}`); }
}

async function waitForServer(max = 30) {
  for (let i = 0; i < max; i++) {
    try {
      const r = await req("GET", "/health");
      if (r.status === 200) return true;
    } catch { await sleep(300); }
  }
  return false;
}

async function run() {
  server = spawn("node", ["src/index.js"], { cwd: process.cwd(), stdio: "inherit" });
  const ready = await waitForServer();
  if (!ready) { console.error("❌ Server did not start"); server.kill(); process.exit(1); }

  console.log("\n🧪 Running tests...\n");

  // Health
  let r = await req("GET", "/health");
  assert("Health check 200", r.status === 200);

  // ── Public: contact ──
  r = await req("POST", "/api/public/contact", {
    name: "Alice", email: "alice@test.com", phone: "123", message: "Hello there!",
  });
  assert("Contact submission 201", r.status === 201);
  assert("Contact returns success", r.data.success === true);

  r = await req("POST", "/api/public/contact", { email: "x" }); // invalid
  assert("Invalid contact 400", r.status === 400);

  // ── Public: lead ──
  r = await req("POST", "/api/public/lead", {
    name: "Bob", email: "bob@corp.com", company: "Corp", service: "Web Dev", budget: "$5k",
  });
  assert("Lead submission 201", r.status === 201);

  // ── Public: newsletter ──
  r = await req("POST", "/api/public/newsletter", { email: "sub@test.com" });
  assert("Newsletter subscribe 201", r.status === 201);
  r = await req("POST", "/api/public/newsletter", { email: "sub@test.com" }); // duplicate → upsert
  assert("Newsletter re-subscribe ok", r.status === 201);

  // ── Auth ──
  r = await req("POST", "/api/auth/login", { email: "admin@example.com", password: "admin123" });
  assert("Admin login 200", r.status === 200, `(got ${r.status})`);
  assert("Login returns token", !!r.data.token);
  token = r.data.token;

  r = await req("POST", "/api/auth/login", { email: "admin@example.com", password: "wrong" });
  assert("Bad login 401", r.status === 401);

  // ── Protected without token ──
  r = await req("GET", "/api/admin/dashboard");
  assert("Admin route without token 401", r.status === 401);

  // ── Dashboard ──
  r = await req("GET", "/api/admin/dashboard", null, token);
  assert("Dashboard 200", r.status === 200);
  assert("Dashboard has stats", typeof r.data.stats === "object");
  assert("Dashboard counts 1 contact", r.data.stats.contacts === 1, `(got ${r.data.stats.contacts})`);
  assert("Dashboard counts 1 unread", r.data.stats.unreadContacts === 1);
  assert("Dashboard counts 1 lead", r.data.stats.leads === 1);
  assert("Dashboard counts 1 subscriber", r.data.stats.subscribers === 1);

  // ── Contacts list/markread/delete ──
  r = await req("GET", "/api/admin/contacts", null, token);
  assert("List contacts 200", r.status === 200);
  assert("Contacts array has 1", r.data.contacts.length === 1);
  const contactId = r.data.contacts[0].id;

  r = await req("PATCH", `/api/admin/contacts/${contactId}`, { isRead: true }, token);
  assert("Mark contact read 200", r.status === 200);
  r = await req("GET", "/api/admin/dashboard", null, token);
  assert("Unread count now 0", r.data.stats.unreadContacts === 0);

  r = await req("GET", "/api/admin/contacts?unread=true", null, token);
  assert("Unread filter returns 0", r.data.contacts.length === 0);

  // ── Leads status ──
  r = await req("GET", "/api/admin/leads", null, token);
  assert("List leads 200", r.status === 200);
  const leadId = r.data.leads[0].id;
  r = await req("PATCH", `/api/admin/leads/${leadId}`, { status: "won" }, token);
  assert("Update lead status 200", r.status === 200);
  assert("Lead status is won", r.data.lead.status === "won");

  // ── Newsletter list ──
  r = await req("GET", "/api/admin/newsletter", null, token);
  assert("List newsletter 200", r.status === 200);
  assert("Newsletter has 1", r.data.subscribers.length === 1);

  // ── Content ──
  r = await req("PUT", "/api/admin/content/hero_title", { value: "Welcome to my site" }, token);
  assert("Create content 200", r.status === 200);
  r = await req("GET", "/api/content/hero_title");
  assert("Read public content 200", r.status === 200);
  assert("Content value correct", r.data.content.value === "Welcome to my site");

  r = await req("PUT", "/api/admin/content/hero_title", { value: "Updated title" }, token);
  assert("Update content 200", r.status === 200);
  r = await req("GET", "/api/content/hero_title");
  assert("Content updated", r.data.content.value === "Updated title");

  // ── Delete ──
  r = await req("DELETE", `/api/admin/contacts/${contactId}`, null, token);
  assert("Delete contact 200", r.status === 200);
  r = await req("DELETE", `/api/admin/leads/${leadId}`, null, token);
  assert("Delete lead 200", r.status === 200);

  // ── Change password ──
  r = await req("POST", "/api/auth/change-password", { currentPassword: "admin123", newPassword: "newpass123" }, token);
  assert("Change password 200", r.status === 200);
  r = await req("POST", "/api/auth/login", { email: "admin@example.com", password: "newpass123" });
  assert("Login with new password works", r.status === 200);

  console.log(`\n${"─".repeat(50)}`);
  console.log(`✅ Passed: ${passed}   ❌ Failed: ${failed}`);
  server.kill();
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((e) => {
  console.error("Test error:", e);
  if (server) server.kill("SIGKILL");
  process.exit(1);
});

// Safety: kill server on exit
process.on("exit", () => { if (server) server.kill("SIGKILL"); });
