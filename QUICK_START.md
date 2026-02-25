# 🚀 QUICK DEPLOYMENT GUIDE - Sinar Tani

## ✅ Pre-Deployment Checklist

- [x] Git initialized
- [x] Code committed
- [x] .env updated for production
- [x] vercel.json configured
- [ ] MongoDB Atlas setup
- [ ] GitHub repository created
- [ ] Pushed to GitHub
- [ ] Deployed to Vercel

---

## 📋 STEP-BY-STEP DEPLOYMENT

### **STEP 1: Create MongoDB Atlas (3 minutes)**

1. **Go to**: https://www.mongodb.com/cloud/atlas/register
2. **Sign up** with Google/GitHub/email
3. **Create Cluster**:
   - Click "Build a Database"
   - Choose **M0 Sandbox (FREE)**
   - Region: **AWS Singapore** or **Tokyo**
   - Click "Create Cluster"
4. **Create User**:
   - Database Access → Add New User
   - Username: `sinar_tani`
   - Password: **COPY IT!**
   - Permissions: Read and write to any database
5. **Network Access**:
   - Add IP Address → Allow Access from Anywhere (0.0.0.0/0)
6. **Get Connection String**:
   - Database → Connect → Connect your application
   - Copy the string

---

### **STEP 2: Create GitHub Repository (1 minute)**

1. **Go to**: https://github.com/new
2. **Repository name**: `sinar-tani-mongo`
3. **Description**: Platform Digital Rantai Pasok Pertanian Indonesia
4. **Public** or **Private** (your choice)
5. **DO NOT** initialize with README
6. Click **"Create repository"**

---

### **STEP 3: Push to GitHub (1 minute)**

**Option A - Use the batch script:**
```bash
cd C:\Users\Kaka\Downloads\sinar-tani-mongo
push-to-github.bat
```

**Option B - Manual commands:**
```bash
cd C:\Users\Kaka\Downloads\sinar-tani-mongo
git remote remove origin
git remote add origin https://github.com/KakaLovie/sinar-tani-mongo.git
git push -u origin main
```

---

### **STEP 4: Deploy to Vercel (2 minutes)**

1. **Go to**: https://vercel.com
2. **Sign in** with GitHub
3. **Add New Project** → Import Git Repository
4. **Select**: `KakaLovie/sinar-tani-mongo`
5. **Configure Environment Variables**:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | `mongodb+srv://sinar_tani:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/sinar_tani` |
| `JWT_SECRET` | (generate new one, see below) |
| `NODE_ENV` | `production` |

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

6. **Click Deploy**
7. **Wait 1-2 minutes**
8. **Done!** Your app is live 🎉

---

## 🔧 Update .env with MongoDB Atlas

Open `.env` and replace:

```env
MONGODB_URI=mongodb+srv://sinar_tani:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/sinar_tani
```

**Replace:**
- `YOUR_PASSWORD` → Your MongoDB password
- `cluster0.xxxxx` → Your actual cluster URL

---

## 📱 Test Your Deployment

1. Visit your Vercel URL (e.g., `sinar-tani-mongo.vercel.app`)
2. Test login/register
3. Test all features:
   - Dashboard
   - K-MAP (Radar Hama)
   - Pasar Tani
   - Kalkulator Tani
   - Bantuan Dinas

---

## 🐛 Troubleshooting

### Build Failed on Vercel
- Check build logs in Vercel dashboard
- Ensure all dependencies in `package.json`
- Verify Node.js version >= 18

### Database Connection Error
- Check MongoDB Atlas → Network Access → 0.0.0.0/0
- Verify connection string is correct
- Check database user has read/write permissions

### Environment Variables Not Working
- Go to Vercel Project → Settings → Environment Variables
- Ensure all 3 variables are set
- Redeploy after adding variables

---

## 📞 Useful Links

- **MongoDB Atlas**: https://cloud.mongodb.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub Repo**: https://github.com/KakaLovie/sinar-tani-mongo

---

## 🎉 Success!

Your Sinar Tani platform is now:
- ✅ Hosted on Vercel
- ✅ Using MongoDB Atlas
- ✅ Accessible worldwide
- ✅ Ready for users!

---

**Need Help?**
- MongoDB Docs: https://docs.atlas.mongodb.com/
- Vercel Docs: https://vercel.com/docs
- Sinar Tani README: See project README.md
