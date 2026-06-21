/* Admin Dashboard — vanilla JS, no dependencies */
const API = "/api";

const App = {
  token: localStorage.getItem("admin_token"),
  unreadOnly: false,

  /* ─── INIT ─── */
  async init() {
    document.getElementById("base-url").textContent = window.location.origin;

    // Try to fetch site config
    try {
      const res = await fetch(`${API}/content/site_name`);
      if (res.ok) {
        const { content } = await res.json();
        if (content?.value) this.setSiteName(content.value);
      }
    } catch {}

    if (this.token) {
      const valid = await this.checkAuth();
      if (valid) {
        this.showApp();
        return;
      }
    }
    this.showLogin();
  },

  setSiteName(name) {
    document.querySelectorAll("#site-name, #sidebar-site, #login-site").forEach((el) => {
      if (el.id === "login-site") el.textContent = name + " · admin access";
      else el.textContent = name;
    });
  },

  /* ─── AUTH ─── */
  async checkAuth() {
    try {
      const res = await fetch(`${API}/auth/me`, this.authHeaders());
      return res.ok;
    } catch {
      return false;
    }
  },

  authHeaders(extra = {}) {
    return {
      headers: { Authorization: `Bearer ${this.token}`, "Content-Type": "application/json", ...extra },
      ...extra,
    };
  },

  showLogin() {
    document.getElementById("login-screen").classList.remove("hidden");
    document.getElementById("app").classList.add("hidden");
  },

  showApp() {
    document.getElementById("login-screen").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");
    this.navigate(location.hash.slice(1) || "dashboard");
    this.refreshBadges();
  },

  async login(email, password) {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");
    this.token = data.token;
    localStorage.setItem("admin_token", this.token);
    this.showApp();
    this.toast("Welcome back! 👋");
  },

  logout() {
    localStorage.removeItem("admin_token");
    this.token = null;
    this.showLogin();
  },

  /* ─── NAVIGATION ─── */
  navigate(view) {
    document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
    document.querySelectorAll(".nav-item").forEach((n) => n.classList.remove("active"));
    const v = document.getElementById(`view-${view}`) || document.getElementById("view-dashboard");
    v.classList.add("active");
    document.querySelector(`.nav-item[data-view="${view}"]`)?.classList.add("active");

    // Lazy-load data per view
    if (view === "dashboard") this.refreshDashboard();
    if (view === "contacts") this.loadContacts();
    if (view === "leads") this.loadLeads();
    if (view === "newsletter") this.loadNewsletter();
    if (view === "content") this.loadContent();
  },

  /* ─── API HELPER ─── */
  async apiGet(path) {
    const res = await fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${this.token}` } });
    if (res.status === 401) { this.logout(); throw new Error("Session expired"); }
    return res.json();
  },
  async apiSend(method, path, body) {
    const res = await fetch(`${API}${path}`, {
      method,
      headers: { Authorization: `Bearer ${this.token}`, "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.status === 401) { this.logout(); throw new Error("Session expired"); }
    return res.json();
  },

  /* ─── DASHBOARD OVERVIEW ─── */
  async refreshDashboard() {
    try {
      const { stats } = await this.apiGet("/admin/dashboard");
      const cards = [
        { icon: "✉️", value: stats.contacts, label: "Total Messages", hl: stats.unreadContacts > 0 },
        { icon: "🔔", value: stats.unreadContacts, label: "Unread Messages", hl: stats.unreadContacts > 0 },
        { icon: "🎯", value: stats.leads, label: "Total Leads", hl: false },
        { icon: "🆕", value: stats.newLeads, label: "New Leads", hl: stats.newLeads > 0 },
        { icon: "📧", value: stats.subscribers, label: "Subscribers", hl: false },
      ];
      document.getElementById("stats-grid").innerHTML = cards
        .map(
          (c) => `
        <div class="stat-card ${c.hl ? "highlight" : ""}">
          <div class="stat-icon">${c.icon}</div>
          <div class="stat-value">${c.value}</div>
          <div class="stat-label">${c.label}</div>
        </div>`
        )
        .join("");

      // recent contacts
      const { contacts } = await this.apiGet("/admin/contacts");
      const recent = contacts.slice(0, 5);
      const el = document.getElementById("recent-contacts");
      if (recent.length === 0) {
        el.innerHTML = `<div class="empty-state"><div class="es-icon">📭</div><p>No messages yet</p></div>`;
      } else {
        el.innerHTML = recent
          .map(
            (c) => `
          <div class="recent-item" onclick="App.viewContact(${c.id})">
            <div class="ri-body">
              <div class="ri-name">${esc(c.name)}</div>
              <div class="ri-email">${esc(c.email)}</div>
              <div class="ri-msg">${esc(c.message).slice(0, 120)}</div>
            </div>
            <div class="ri-time">${fmtTime(c.created_at)}</div>
          </div>`
          )
          .join("");
      }
    } catch (e) {
      this.toast("Failed to load dashboard", true);
    }
  },

  async refreshBadges() {
    try {
      const { stats } = await this.apiGet("/admin/dashboard");
      const cb = document.getElementById("badge-contacts");
      const lb = document.getElementById("badge-leads");
      if (stats.unreadContacts > 0) { cb.textContent = stats.unreadContacts; cb.classList.remove("hidden"); }
      else cb.classList.add("hidden");
      if (stats.newLeads > 0) { lb.textContent = stats.newLeads; lb.classList.remove("hidden"); }
      else lb.classList.add("hidden");
    } catch {}
  },

  /* ─── CONTACTS ─── */
  toggleUnread() {
    this.unreadOnly = !this.unreadOnly;
    this.loadContacts();
  },

  async loadContacts() {
    try {
      const path = this.unreadOnly ? "/admin/contacts?unread=true" : "/admin/contacts";
      const { contacts } = await this.apiGet(path);
      const el = document.getElementById("contacts-table");
      if (contacts.length === 0) {
        el.innerHTML = `<div class="empty-state"><div class="es-icon">📭</div><p>No messages yet</p></div>`;
        return;
      }
      el.innerHTML = `
        <table class="data-table">
          <thead><tr>
            <th>Name</th><th>Email</th><th>Message</th><th>Received</th><th></th>
          </tr></thead>
          <tbody>
            ${contacts
              .map(
                (c) => `
              <tr class="${!c.is_read ? "unread" : ""}">
                <td><strong>${esc(c.name)}</strong>${c.phone ? `<br><span class="cell-time">${esc(c.phone)}</span>` : ""}</td>
                <td>${esc(c.email)}</td>
                <td class="cell-truncate" title="${esc(c.message)}">${esc(c.message)}</td>
                <td class="cell-time">${fmtTime(c.created_at)}</td>
                <td class="cell-actions">
                  <button class="btn btn-ghost btn-sm" onclick="App.viewContact(${c.id})">👁</button>
                  <button class="btn btn-ghost btn-sm" onclick="App.toggleRead(${c.id}, ${!c.is_read})">${c.is_read ? "Mark unread" : "Mark read"}</button>
                  <button class="btn btn-danger btn-sm" onclick="App.deleteContact(${c.id})">🗑</button>
                </td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>`;
      this.refreshBadges();
    } catch (e) {
      this.toast("Failed to load contacts", true);
    }
  },

  async viewContact(id) {
    const { contacts } = await this.apiGet("/admin/contacts");
    const c = contacts.find((x) => x.id === id);
    if (!c) return;
    if (!c.is_read) this.toggleRead(id, true);
    this.modal(`
      <h3>${esc(c.name)}</h3>
      <p class="m-sub">Contact message · ${fmtTime(c.created_at)}</p>
      ${detailRow("Email", c.email)}
      ${c.phone ? detailRow("Phone", c.phone) : ""}
      ${c.subject ? detailRow("Subject", c.subject) : ""}
      <div class="detail-row"><div class="dr-label">Message</div><div class="dr-value">${esc(c.message)}</div></div>
    `);
  },

  async toggleRead(id, isRead) {
    await this.apiSend("PATCH", `/admin/contacts/${id}`, { isRead });
    this.loadContacts();
  },

  async deleteContact(id) {
    if (!confirm("Delete this message?")) return;
    await this.apiSend("DELETE", `/admin/contacts/${id}`);
    this.toast("Message deleted");
    this.loadContacts();
  },

  /* ─── LEADS ─── */
  async loadLeads() {
    try {
      const { leads } = await this.apiGet("/admin/leads");
      const el = document.getElementById("leads-table");
      if (leads.length === 0) {
        el.innerHTML = `<div class="empty-state"><div class="es-icon">🎯</div><p>No leads yet</p></div>`;
        return;
      }
      el.innerHTML = `
        <table class="data-table">
          <thead><tr>
            <th>Name</th><th>Contact</th><th>Company</th><th>Service</th><th>Status</th><th>Date</th><th></th>
          </tr></thead>
          <tbody>
            ${leads
              .map(
                (l) => `
              <tr>
                <td><strong>${esc(l.name)}</strong></td>
                <td>${esc(l.email)}${l.phone ? `<br><span class="cell-time">${esc(l.phone)}</span>` : ""}</td>
                <td>${esc(l.company || "—")}</td>
                <td>${esc(l.service || "—")}</td>
                <td>
                  <select class="pill pill-${l.status}" onchange="App.setLeadStatus(${l.id}, this.value)" style="border:none;cursor:pointer;font-weight:600;padding:4px 10px;border-radius:20px;">
                    <option value="new" ${l.status === "new" ? "selected" : ""}>New</option>
                    <option value="contacted" ${l.status === "contacted" ? "selected" : ""}>Contacted</option>
                    <option value="won" ${l.status === "won" ? "selected" : ""}>Won</option>
                    <option value="lost" ${l.status === "lost" ? "selected" : ""}>Lost</option>
                  </select>
                </td>
                <td class="cell-time">${fmtTime(l.created_at)}</td>
                <td class="cell-actions">
                  <button class="btn btn-ghost btn-sm" onclick='App.viewLead(${JSON.stringify(l).replace(/'/g, "&#39;")})'>👁</button>
                  <button class="btn btn-danger btn-sm" onclick="App.deleteLead(${l.id})">🗑</button>
                </td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>`;
      this.refreshBadges();
    } catch (e) {
      this.toast("Failed to load leads", true);
    }
  },

  viewLead(l) {
    this.modal(`
      <h3>${esc(l.name)}</h3>
      <p class="m-sub">Business Lead · ${fmtTime(l.created_at)}</p>
      ${detailRow("Email", l.email)}
      ${l.phone ? detailRow("Phone", l.phone) : ""}
      ${l.company ? detailRow("Company", l.company) : ""}
      ${l.service ? detailRow("Service", l.service) : ""}
      ${l.budget ? detailRow("Budget", l.budget) : ""}
      ${l.message ? `<div class="detail-row"><div class="dr-label">Message</div><div class="dr-value">${esc(l.message)}</div></div>` : ""}
    `);
  },

  async setLeadStatus(id, status) {
    await this.apiSend("PATCH", `/admin/leads/${id}`, { status });
    this.toast("Status updated");
    this.refreshBadges();
  },

  async deleteLead(id) {
    if (!confirm("Delete this lead?")) return;
    await this.apiSend("DELETE", `/admin/leads/${id}`);
    this.toast("Lead deleted");
    this.loadLeads();
  },

  /* ─── NEWSLETTER ─── */
  async loadNewsletter() {
    try {
      const { subscribers } = await this.apiGet("/admin/newsletter");
      const el = document.getElementById("newsletter-table");
      if (subscribers.length === 0) {
        el.innerHTML = `<div class="empty-state"><div class="es-icon">📧</div><p>No subscribers yet</p></div>`;
        return;
      }
      el.innerHTML = `
        <table class="data-table">
          <thead><tr><th>Email</th><th>Status</th><th>Subscribed</th><th></th></tr></thead>
          <tbody>
            ${subscribers
              .map(
                (s) => `
              <tr>
                <td><strong>${esc(s.email)}</strong></td>
                <td><span class="pill pill-${s.active ? "active" : "inactive"}">${s.active ? "Active" : "Unsubscribed"}</span></td>
                <td class="cell-time">${fmtTime(s.created_at)}</td>
                <td class="cell-actions"><button class="btn btn-danger btn-sm" onclick="App.deleteSubscriber(${s.id})">🗑</button></td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>`;
    } catch (e) {
      this.toast("Failed to load subscribers", true);
    }
  },

  async deleteSubscriber(id) {
    if (!confirm("Remove this subscriber?")) return;
    await this.apiSend("DELETE", `/admin/newsletter/${id}`);
    this.toast("Subscriber removed");
    this.loadNewsletter();
  },

  /* ─── CONTENT ─── */
  async loadContent() {
    try {
      const { content } = await this.apiGet("/content");
      const el = document.getElementById("content-list");
      if (content.length === 0) {
        el.innerHTML = `<div class="empty-state"><div class="es-icon">📝</div><p>No content blocks yet. Add one below.</p></div>`;
        return;
      }
      el.innerHTML = content
        .map(
          (c) => `
        <div class="content-item">
          <span class="ci-key">${esc(c.section)}</span>
          <textarea id="content-val-${c.section}" rows="2">${esc(c.value)}</textarea>
          <div class="ci-actions">
            <button class="btn btn-primary btn-sm" onclick="App.saveContent('${esc(c.section)}')">💾 Save</button>
            <button class="btn btn-danger btn-sm" onclick="App.deleteContent('${esc(c.section)}')">🗑 Delete</button>
          </div>
        </div>`
        )
        .join("");
    } catch (e) {
      this.toast("Failed to load content", true);
    }
  },

  async addContent() {
    const section = document.getElementById("content-section").value.trim();
    const value = document.getElementById("content-value").value;
    if (!section) return this.toast("Enter a section key", true);
    await this.apiSend("PUT", `/admin/content/${section}`, { value, key: section });
    document.getElementById("content-section").value = "";
    document.getElementById("content-value").value = "";
    this.toast("Content added");
    this.loadContent();
  },

  async saveContent(section) {
    const value = document.getElementById(`content-val-${section}`).value;
    await this.apiSend("PUT", `/admin/content/${section}`, { value });
    this.toast("Saved ✓");
  },

  async deleteContent(section) {
    if (!confirm(`Delete content "${section}"?`)) return;
    await this.apiSend("DELETE", `/admin/content/${section}`);
    this.toast("Content deleted");
    this.loadContent();
  },

  /* ─── CSV EXPORT ─── */
  async exportCsv(type) {
    let rows = [];
    let headers = [];
    if (type === "contacts") {
      const { contacts } = await this.apiGet("/admin/contacts");
      headers = ["name", "email", "phone", "subject", "message", "created_at"];
      rows = contacts;
    } else if (type === "leads") {
      const { leads } = await this.apiGet("/admin/leads");
      headers = ["name", "email", "phone", "company", "service", "budget", "message", "status", "created_at"];
      rows = leads;
    } else if (type === "newsletter") {
      const { subscribers } = await this.apiGet("/admin/newsletter");
      headers = ["email", "active", "created_at"];
      rows = subscribers;
    }
    const csv = [
      headers.join(","),
      ...rows.map((r) => headers.map((h) => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    this.toast("Exported CSV ⬇");
  },

  /* ─── MODAL & TOAST ─── */
  modal(html) {
    document.getElementById("modal-card").innerHTML = `<button class="modal-close" onclick="App.closeModal()">×</button>${html}`;
    document.getElementById("modal").classList.remove("hidden");
  },
  closeModal() {
    document.getElementById("modal").classList.add("hidden");
  },
  toast(msg, isError) {
    const t = document.getElementById("toast");
    t.textContent = msg;
    t.style.background = isError ? "#dc2626" : "#0f172a";
    t.classList.remove("hidden");
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => t.classList.add("hidden"), 3000);
  },
};

/* ─── HELPERS ─── */
function esc(str) {
  return String(str ?? "").replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
}
function detailRow(label, value) {
  return `<div class="detail-row"><div class="dr-label">${label}</div><div class="dr-value">${esc(value)}</div></div>`;
}
function fmtTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString();
}

/* ─── EVENT WIRING ─── */
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const errEl = document.getElementById("login-error");
  errEl.classList.add("hidden");
  try {
    await App.login(
      document.getElementById("login-email").value,
      document.getElementById("login-password").value
    );
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.remove("hidden");
  }
});

document.getElementById("logout-btn").addEventListener("click", () => App.logout());

document.getElementById("password-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const msg = document.getElementById("password-msg");
  msg.classList.add("hidden");
  try {
    const res = await fetch(`${API}/auth/change-password`, {
      method: "POST",
      headers: { Authorization: `Bearer ${App.token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: document.getElementById("current-password").value,
        newPassword: document.getElementById("new-password").value,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed");
    msg.textContent = "✓ Password updated successfully";
    msg.className = "msg success";
    e.target.reset();
  } catch (err) {
    msg.textContent = err.message;
    msg.className = "msg error";
  }
});

document.querySelectorAll(".nav-item").forEach((item) => {
  item.addEventListener("click", (e) => {
    e.preventDefault();
    const view = item.dataset.view;
    location.hash = view;
    App.navigate(view);
  });
});

window.addEventListener("hashchange", () => App.navigate(location.hash.slice(1) || "dashboard"));

App.init();
