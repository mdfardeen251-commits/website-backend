# 🚀 Deploy to Render - Step by Step

## Step 1: Create GitHub Account & Push Code
**[Skip if you already have your repo on GitHub]**

1. Go to **GitHub.com** → Sign up (if needed)
2. Click **Create Repository** 
3. Name it: `backend` (or anything)
4. Click **Create**
5. Copy the commands they show you
6. Go to **PowerShell** on your computer and run them:

```powershell
cd C:\Users\Hashm\Downloads\backend
git init
git add .
git commit -m "Initial commit - backend ready"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/backend.git
git push -u origin main
```

*(Replace `YOUR_USERNAME` with your GitHub username)*

---

## Step 2: Deploy to Render
**[Most Important - Do This Now]**

1. Go to **[render.com](https://render.com)**
2. Click **Sign Up** → Use GitHub (easiest)
3. Click **Authorize**
4. Click **New +** → **Web Service**
5. Select your GitHub repo (the one you just created)
6. Fill in these settings:

| Setting | Value |
|---------|-------|
| **Name** | `my-backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Plan** | `Free` |

7. Click **Create Web Service**
8. **WAIT** 3-5 minutes while it deploys (watch the logs)

---

## Step 3: Set Environment Variables
**[Your server needs these to work]**

1. In your Render dashboard, go to **Environment** tab
2. Click **Add Environment Variable** for each:

```
DATABASE_URL = your_postgres_url_here (leave empty for SQLite)
JWT_SECRET = some-random-secret-12345
ADMIN_EMAIL = admin@yoursite.com
ADMIN_PASSWORD = yourpassword123
CORS_ORIGIN = *
SITE_NAME = My Website
NODE_ENV = production
```

3. Click **Save**
4. Click **Deploy** → **Manual Deploy**
5. Wait for "Deploy successful" ✅

---

## Step 4: Test Your Deployment

Your app is now live! Visit:
```
https://YOUR_SERVICE_NAME.render.com
```

You should see:
- ✅ Login page loads
- ✅ API works at: `https://YOUR_SERVICE_NAME.render.com/api/public`
- ✅ Health check: `https://YOUR_SERVICE_NAME.render.com/health`

---

## ⚠️ If You Get Error: "Public Folder Not Found"

1. Go to Render Dashboard → Your Service → **Shell**
2. Run this command:

```bash
mkdir -p public/css public/js && \
cat > public/index.html << 'EOF'
<!DOCTYPE html>
<html><body><h1>Dashboard Loading...</h1></body></html>
EOF
```

3. Click **Manual Deploy**
4. Done! ✅

---

## 🔍 Troubleshooting

| Issue | Solution |
|-------|----------|
| Can't see logs | Click **Logs** tab in Render dashboard |
| "Cannot find module" | Make sure `npm install` in Build Command |
| Database errors | Check `DATABASE_URL` in Environment tab |
| Page blank | Check browser console (F12) for errors |

---

## 💡 Tips

- **Auto-deploy:** Every time you `git push`, Render deploys automatically
- **Logs:** Check **Logs** tab if something breaks
- **Free tier:** Wakes up after 15 min idle (first request is slow)
- **Custom domain:** Upgrade to Pro to use your own domain

---

**Done! Your backend is live! 🎉**

Questions? Check the logs or reach out!
