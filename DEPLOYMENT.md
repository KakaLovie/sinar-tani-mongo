# 🚀 Sinar Tani - Vercel Deployment Guide

## Step 1: Set Up MongoDB Atlas (FREE)

### 1.1 Create Account
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up with Google, GitHub, or email
3. **No credit card required** for free tier

### 1.2 Create Free Cluster
1. After login, click **"Build a Database"** or **"Create Cluster"**
2. Choose **"M0 Sandbox"** (FREE forever)
3. Select region close to you:
   - **AWS - Singapore (ap-southeast-1)** or **Tokyo** for Indonesia
4. Click **"Create Cluster"** (takes 2-3 minutes)

### 1.3 Create Database User
1. Click **"Database Access"** in left sidebar
2. Click **"+ ADD NEW DATABASE USER"**
3. Choose **Password** authentication
4. Username: `sinar_tani`
5. Click **"Autogenerate Secure Password"** and **COPY IT**
6. Database User Privileges: **"Read and write to any database"**
7. Click **"Add User"**

### 1.4 Whitelist IP Address
1. Click **"Network Access"** in left sidebar
2. Click **"+ ADD IP ADDRESS"**
3. Click **"ALLOW ACCESS FROM ANYWHERE"** (0.0.0.0/0)
4. Click **"Confirm"**

### 1.5 Get Connection String
1. Click **"Database"** in left sidebar
2. Click **"Connect"** button on your cluster
3. Choose **"Connect your application"**
4. Copy the connection string (looks like):
   ```
   mongodb+srv://sinar_tani:<password>@cluster0.xxxxx.mongodb.net/
   ```

---

## Step 2: Update .env File

### 2.1 Generate Secure JWT Secret
Run this in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Copy the output string.

### 2.2 Edit .env
Open `.env` and update:

```env
PORT=3000
NODE_ENV=production
MONGODB_URI=mongodb+srv://sinar_tani:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/sinar_tani
JWT_SECRET=paste_your_generated_secret_here
JWT_EXPIRES_IN=7d
```

**Replace:**
- `YOUR_PASSWORD` with the password from Step 1.3
- `cluster0.xxxxx` with your actual cluster URL
- `paste_your_generated_secret_here` with the secret from 2.1

---

## Step 3: Push to GitHub

### 3.1 Initialize Git (if not already)
```bash
cd C:\Users\Kaka\Downloads\sinar-tani-mongo
git init
git add .
git commit -m "Initial commit - Sinar Tani v2.0"
```

### 3.2 Connect to GitHub
```bash
git remote add origin https://github.com/KakaLovie/sinar-tani-mongo.git
git branch -M main
git push -u origin main
```

**If you already have a repo:**
```bash
git add .
git commit -m "Update for Vercel deployment"
git push origin main
```

---

## Step 4: Deploy to Vercel

### 4.1 Go to Vercel
1. Visit: https://vercel.com
2. Sign in with GitHub account

### 4.2 Import Project
1. Click **"Add New Project"**
2. Select **"Import Git Repository"**
3. Find and select: `KakaLovie/sinar-tani-mongo`
4. Click **"Import"**

### 4.3 Configure Environment Variables
In Vercel's environment variables section, add:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | `mongodb+srv://sinar_tani:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/sinar_tani` |
| `JWT_SECRET` | Your generated secret string |
| `NODE_ENV` | `production` |

### 4.4 Deploy
1. Click **"Deploy"**
2. Wait 1-2 minutes for build
3. Your app is live! 🎉

---

## Step 5: Seed Demo Data (Optional)

After deployment, you can seed demo data by:
1. Going to your Vercel project dashboard
2. Click **"Settings"** → **"Deployment Hooks"**
3. Or use Vercel CLI:
   ```bash
   vercel run npm run seed
   ```

**Demo Accounts** (after seeding):
- admin@demo.com / admin1234
- kader@demo.com / demo1234
- petani@demo.com / demo1234
- dinas@demo.com / demo1234

---

## 📁 Files Already Configured

✅ `vercel.json` - Vercel configuration
✅ `.gitignore` - Excludes node_modules and .env
✅ `server.js` - Exports app for Vercel
✅ `database/connect.js` - MongoDB connection with caching

---

## 🔧 Troubleshooting

### Build Fails
- Check Vercel build logs
- Ensure all dependencies in package.json
- Verify Node.js version >= 18

### Database Connection Error
- Check MongoDB Atlas IP whitelist (0.0.0.0/0)
- Verify connection string is correct
- Ensure database user has read/write permissions

### API Errors
- Check environment variables in Vercel
- Verify JWT_SECRET is set
- Check MongoDB connection in logs

---

## 📞 Support

- MongoDB Atlas Docs: https://docs.atlas.mongodb.com/
- Vercel Docs: https://vercel.com/docs
- Vercel + MongoDB Guide: https://vercel.com/guides/nextjs-mongodb

---

**Status**: Ready for deployment! 🚀
