#!/bin/bash
# 🚀 RENDER DEPLOYMENT SCRIPT - Copy & Paste This Into Render Shell

echo "🔨 Setting up deployment..."

# Create public folder structure
mkdir -p public/css
mkdir -p public/js

# Create index.html (main dashboard)
cat > public/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Dashboard · <span id="site-name">Admin</span></title>
  <link rel="stylesheet" href="/css/style.css" />
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📊</text></svg>" />
</head>
<body>

  <!-- LOGIN SCREEN -->
  <div id="login-screen" class="login-screen">
    <div class="login-card">
      <div class="login-logo">📊</div>
      <h1>Admin Dashboard</h1>
      <p id="login-site" class="login-sub">Sign in to manage your website</p>
      <form id="login-form">
        <div class="field">
          <label>Email</label>
          <input type="email" id="login-email" placeholder="admin@example.com" required autocomplete="username" />
        </div>
        <div class="field">
          <label>Password</label>
          <input type="password" id="login-password" placeholder="••••••••" required autocomplete="current-password" />
        </div>
        <div id="login-error" class="error-msg hidden"></div>
        <button type="submit" class="btn btn-primary btn-block">Sign In</button>
      </form>
    </div>
  </div>

  <!-- MAIN APP -->
  <div id="app" class="app hidden">
    <aside class="sidebar">
      <div class="sidebar-brand">
        <span class="brand-icon">📊</span>
        <span id="sidebar-site" class="brand-text">Dashboard</span>
      </div>
      <nav class="sidebar-nav">
        <a href="#dashboard" class="nav-item active" data-view="dashboard">📈 Overview</a>
        <a href="#contacts" class="nav-item" data-view="contacts">✉️ Contacts</a>
        <a href="#leads" class="nav-item" data-view="leads">🎯 Leads</a>
        <a href="#newsletter" class="nav-item" data-view="newsletter">📧 Newsletter</a>
        <a href="#content" class="nav-item" data-view="content">📝 Content</a>
        <a href="#settings" class="nav-item" data-view="settings">⚙️ Settings</a>
      </nav>
      <button id="logout-btn" class="logout-btn">🚪 Logout</button>
    </aside>
    <main class="main-content">
      <div id="dashboard" class="view active">Dashboard Loading...</div>
      <div id="contacts" class="view">Contacts Loading...</div>
      <div id="leads" class="view">Leads Loading...</div>
      <div id="newsletter" class="view">Newsletter Loading...</div>
      <div id="content" class="view">Content Loading...</div>
      <div id="settings" class="view">Settings Loading...</div>
    </main>
  </div>

  <script src="/js/app.js"></script>
</body>
</html>
EOF

# Create minimal app.js
cat > public/js/app.js << 'EOF'
const API = "/api";
const App = {
  token: localStorage.getItem("admin_token"),
  async init() {
    if (this.token) {
      const valid = await this.checkAuth();
      if (valid) { this.showApp(); return; }
    }
    this.showLogin();
  },
  async checkAuth() {
    try {
      const res = await fetch(`${API}/auth/me`, { 
        headers: { Authorization: `Bearer ${this.token}`, "Content-Type": "application/json" }
      });
      return res.ok;
    } catch { return false; }
  },
  showLogin() {
    document.getElementById("login-screen").classList.remove("hidden");
    document.getElementById("app").classList.add("hidden");
    document.getElementById("login-form").addEventListener("submit", (e) => this.handleLogin(e));
  },
  async handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const { token } = await res.json();
        this.token = token;
        localStorage.setItem("admin_token", token);
        this.showApp();
      } else {
        document.getElementById("login-error").textContent = "Invalid credentials";
        document.getElementById("login-error").classList.remove("hidden");
      }
    } catch (err) {
      document.getElementById("login-error").textContent = "Login failed: " + err.message;
      document.getElementById("login-error").classList.remove("hidden");
    }
  },
  showApp() {
    document.getElementById("login-screen").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");
  }
};

// Start the app
App.init();
EOF

# Create style.css
cat > public/css/style.css << 'EOF'
:root {
  --bg: #0f172a;
  --bg-soft: #1e293b;
  --bg-card: #ffffff;
  --sidebar: #111827;
  --text: #1e293b;
  --text-light: #64748b;
  --primary: #6366f1;
  --primary-dark: #4f46e5;
  --border: #e2e8f0;
  --radius: 12px;
  --shadow: 0 1px 3px rgba(0,0,0,0.08);
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: #f1f5f9;
  color: var(--text);
}

.hidden { display: none !important; }

.login-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  padding: 20px;
}

.login-card {
  background: #fff;
  padding: 48px 40px;
  border-radius: 20px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.login-logo { font-size: 48px; text-align: center; margin-bottom: 24px; }
.login-card h1 { text-align: center; margin-bottom: 8px; font-size: 24px; }
.login-sub { text-align: center; color: var(--text-light); margin-bottom: 32px; }

.field { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
.field label { font-weight: 600; font-size: 14px; }
.field input { padding: 10px 12px; border: 1.5px solid var(--border); border-radius: 8px; font-size: 14px; }

.btn { padding: 12px 16px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
.btn-primary { background: var(--primary); color: #fff; }
.btn-primary:hover { background: var(--primary-dark); }
.btn-block { width: 100%; }

.error-msg { color: #ef4444; font-size: 14px; margin-top: 8px; }

.app { display: flex; min-height: 100vh; }
.sidebar { width: 250px; background: var(--sidebar); color: #fff; padding: 20px; }
.sidebar-brand { font-size: 18px; font-weight: 700; margin-bottom: 32px; display: flex; align-items: center; gap: 10px; }
.brand-icon { font-size: 28px; }

.sidebar-nav { display: flex; flex-direction: column; gap: 8px; margin-bottom: 32px; }
.nav-item { padding: 12px 16px; border-radius: 8px; text-decoration: none; color: #cbd5e1; cursor: pointer; }
.nav-item.active { background: var(--primary); color: #fff; }

.logout-btn { background: #ef4444; color: #fff; border: none; padding: 12px; border-radius: 8px; width: 100%; cursor: pointer; font-weight: 600; }

.main-content { flex: 1; padding: 40px; }
.view { display: none; }
.view.active { display: block; }
EOF

echo "✅ All files created successfully!"
echo "✅ Public folder is ready at /opt/render/project/public"
echo ""
echo "📋 Next steps:"
echo "1. Click 'Manual Deploy' button in Render"
echo "2. Wait 2-3 minutes for deployment"
echo "3. Visit your service URL"
EOF
