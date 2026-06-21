# 📊 Website Backend + Admin Dashboard

A complete backend system with an **admin dashboard** for a business website.
Collect contact messages, leads, and newsletter signups from your **Surge frontend**,
manage everything from a beautiful dashboard, and edit website content — all in one place.

## What You Get

| Feature | Description |
|---------|-------------|
| 📨 **Contact messages** | Visitors' contact form submissions |
| 🎯 **Business leads** | Inquiries with company, service, budget, status tracking |
| 📧 **Newsletter** | Email subscribers with CSV export |
| 📝 **Content manager** | Edit website text/content from the dashboard |
| 📊 **Dashboard** | Overview stats, recent activity, badges |
| 🔐 **Secure login** | JWT auth, password change, rate-limited public forms |
| ⬇️ **CSV export** | Export contacts, leads, and subscribers |
| 🗄️ **Dual database** | SQLite for local dev, PostgreSQL for production |

## Quick Start (Local)

```bash
npm install
cp .env.example .env      # edit ADMIN_EMAIL / ADMIN_PASSWORD
npm run dev
```

Then open **http://localhost:3000** → login with your admin credentials.

> 💡 Without `DATABASE_URL`, it uses SQLite automatically (no setup needed).
> For production, add a PostgreSQL connection string.

## Database Setup (for production / Render)

Data must live somewhere permanent. On Render's free tier, SQLite data is **lost on restart**,
so use a free PostgreSQL database:

1. **Supabase** (recommended, free 500MB): https://supabase.com
   - Create a project → Settings → Database → copy the **Connection string**
   - It looks like: `postgresql://postgres:PASSWORD@db.xxxx.supabase.co:5432/postgres`
2. Set `DATABASE_URL` to that string in your `.env` (local) or Render env vars.

Alternatives: **Neon** (https://neon.tech) or **Render Postgres**.

## Connecting Your Surge Frontend

Your Surge website is static, so it calls the backend's public API via `fetch`.

**Step 1** — Deploy the backend (see below), get its URL (e.g. `https://website-backend.onrender.com`).

**Step 2** — Set `CORS_ORIGIN` in backend env to your Surge domain:
```
CORS_ORIGIN=https://my-site.surge.sh
```

**Step 3** — Add this to your website's contact form:

```javascript
document.querySelector('#contact-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const res = await fetch('https://website-backend.onrender.com/api/public/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: fd.get('name'),
      email: fd.get('email'),
      phone: fd.get('phone'),
      message: fd.get('message'),
    }),
  });
  alert(res.ok ? 'Message sent!' : 'Something went wrong');
});
```

> See **`public/integration-example.html`** for full, copy-paste examples of every form.
> Visit `http://localhost:3000/integration-example.html` for a live demo.

## API Reference

### Public (no auth — for your website visitors)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/public/contact` | Submit contact form |
| POST | `/api/public/lead` | Submit business inquiry |
| POST | `/api/public/newsletter` | Newsletter signup |
| GET | `/api/content` | Get all content blocks |
| GET | `/api/content/:section` | Get one content block |

### Auth
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/login` | Admin login → JWT |
| GET | `/api/auth/me` | Current admin |
| POST | `/api/auth/change-password` | Change password |

### Admin (auth required)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/admin/dashboard` | Stats overview |
| GET | `/api/admin/contacts` | List contacts (`?unread=true`) |
| PATCH | `/api/admin/contacts/:id` | Mark read/unread |
| DELETE | `/api/admin/contacts/:id` | Delete contact |
| GET | `/api/admin/leads` | List leads |
| PATCH | `/api/admin/leads/:id` | Update status |
| DELETE | `/api/admin/leads/:id` | Delete lead |
| GET | `/api/admin/newsletter` | List subscribers (`?active=true`) |
| DELETE | `/api/admin/newsletter/:id` | Remove subscriber |
| PUT | `/api/admin/content/:section` | Create/update content |
| DELETE | `/api/admin/content/:section` | Delete content |

## Deploy to Render

1. Push this `backend/` folder to a GitHub repo.
2. On https://render.com → **New** → **Blueprint** → select your repo (uses `render.yaml`).
3. Set `DATABASE_URL` to your Supabase/Neon connection string.
4. Set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `CORS_ORIGIN` (your Surge domain).
5. Deploy! Your dashboard will be at the Render URL.

## Run Tests

```bash
npm test
```

## Project Structure

```
backend/
├── src/
│   ├── index.js              # App entry — serves API + dashboard
│   ├── config.js             # Environment config
│   ├── db/
│   │   ├── pool.js           # Dual SQLite/Postgres query layer
│   │   └── init.js           # Schema + admin seeding
│   ├── models/               # admin, contact, lead, newsletter, content
│   ├── controllers/          # public, auth, admin, content
│   ├── routes/               # public, content, auth, admin
│   └── middleware/           # auth, errorHandler
├── public/                   # Admin dashboard (static frontend)
│   ├── index.html            # Dashboard SPA
│   ├── css/style.css
│   ├── js/app.js
│   └── integration-example.html
├── render.yaml               # Render deployment config
├── .env.example
└── README.md
```
