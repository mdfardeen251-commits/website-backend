# ✅ DEPLOYMENT CHECKLIST - Do These 3 Things

## ☐ THING 1: Push Code to GitHub (Do First)

Open PowerShell and run these 6 commands ONE BY ONE:

```powershell
cd C:\Users\Hashm\Downloads\backend
git init
git add .
git commit -m "Deploy backend"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

**⚠️ IMPORTANT:** Replace:
- `YOUR_USERNAME` = Your GitHub username  
- `YOUR_REPO` = Repo name (e.g., `backend`, `my-backend`)

✅ When done, you'll see: `✓ master → origin/master` or similar

---

## ☐ THING 2: Create Render Service (Do Second)

1. Go to **render.com** 
2. Sign up with GitHub
3. Click **New +** → **Web Service**
4. Select your GitHub repo from dropdown
5. Click **Create Web Service**
6. **WAIT 3-5 minutes** ⏳ (watch the logs - you'll see "Deployed!")

✅ You'll get a URL like: `https://my-backend-xxxx.render.com`

---

## ☐ THING 3: Set Environment Variables (Do Third)

1. In Render, click **Environment** tab
2. Add these variables:

```
DATABASE_URL = (leave blank for now)
JWT_SECRET = mysecret123456
ADMIN_EMAIL = admin@test.com
ADMIN_PASSWORD = password123
CORS_ORIGIN = *
SITE_NAME = My Website
```

3. Click **Deploy** → **Manual Deploy**
4. **WAIT 1-2 minutes** until it says "Deploy successful" ✅

---

## ✨ DONE!

Your backend is live! 🎉

**Test it:**
- Dashboard: `https://YOUR_SERVICE.render.com/`
- API Health: `https://YOUR_SERVICE.render.com/health`
- Login with: 
  - Email: `admin@test.com`
  - Password: `password123`

---

## 🆘 STUCK?

1. **Check Render Logs:** Click **Logs** tab for error messages
2. **Check GitHub:** Make sure files were pushed (`git push` output)
3. **Wait:** Sometimes takes 5-10 min for first deployment
4. **Read DEPLOY_TO_RENDER.md:** Has troubleshooting tips

**Got an error?** Send the error message and I'll fix it! 💪
