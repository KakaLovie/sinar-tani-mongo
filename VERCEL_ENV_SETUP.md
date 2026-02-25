# ⚙️ Vercel Environment Variables Setup

## 🚨 PENTING: Set Environment Variables di Vercel Dashboard

Error deployment terjadi karena environment variables tidak ter-set dengan benar.

### ✅ Cara Set Environment Variables

1. **Buka Vercel Dashboard**
   - Go to: https://vercel.com/dashboard
   - Click project "sinar-tani-mongo"

2. **Navigate to Settings**
   - Click tab **Settings**
   - Click **Environment Variables** in left sidebar

3. **Add Environment Variables**

   Click **Add New** untuk setiap variable berikut:

   #### 1. MONGODB_URI
   ```
   Name: MONGODB_URI
   Value: mongodb+srv://username:password@cluster.mongodb.net/sinar_tani
   Environments: ✓ Production, ✓ Preview, ✓ Development
   ```

   **Cara mendapatkan MongoDB URI:**
   - Login ke MongoDB Atlas: https://cloud.mongodb.com
   - Click "Connect" pada cluster Anda
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` dengan password Anda
   - Replace `<dbname>` dengan `sinar_tani`

   #### 2. JWT_SECRET
   ```
   Name: JWT_SECRET
   Value: sinar_tani_secret_key_2026_production_change_this
   Environments: ✓ Production, ✓ Preview, ✓ Development
   ```

   **Note:** Ganti dengan secret key Anda sendiri yang lebih secure!

   #### 3. NODE_ENV (Optional - biasanya auto-set)
   ```
   Name: NODE_ENV
   Value: production
   Environments: ✓ Production
   ```

4. **Save & Redeploy**
   - Click **Save**
   - Go to **Deployments** tab
   - Click **Redeploy** pada deployment yang failed
   - Atau push commit baru untuk trigger auto-deploy

---

## 🔍 Check Deployment Status

### Vercel Dashboard
1. https://vercel.com/dashboard
2. Click "sinar-tani-mongo"
3. Lihat **Deployments** section

### Deployment Logs
Jika masih error:
1. Click deployment yang failed
2. Click **View Logs** atau **Function Logs**
3. Lihat error message

### Common Errors & Solutions

#### Error: "MONGODB_URI is not defined"
**Solution:** Set MONGODB_URI di Environment Variables (lihat di atas)

#### Error: "MongoServerError: bad auth"
**Solution:**
- Check username/password di MongoDB URI
- Pastikan password tidak mengandung karakter special (atau URL-encode)
- Test connection string di MongoDB Atlas

#### Error: "MongoNetworkError: failed to connect"
**Solution:**
1. MongoDB Atlas → Network Access
2. Add IP Address: `0.0.0.0/0` (Allow from anywhere)
3. Save changes

#### Error: "MODULE_NOT_FOUND"
**Solution:**
- Check `package.json` semua dependencies ada
- Run `npm install` local
- Push `package-lock.json` ke GitHub

---

## ✅ Deployment Checklist

### Before Deploy
- [ ] MONGODB_URI set di Vercel
- [ ] JWT_SECRET set di Vercel
- [ ] MongoDB Atlas Network Access: 0.0.0.0/0
- [ ] All dependencies in package.json
- [ ] package-lock.json committed

### After Deploy
- [ ] Deployment status: Ready
- [ ] No errors in logs
- [ ] Homepage loads (no 500)
- [ ] Login works
- [ ] Dashboard loads
- [ ] All features accessible

---

## 🔗 Quick Links

- **Vercel Dashboard:** https://vercel.com/dashboard
- **MongoDB Atlas:** https://cloud.mongodb.com
- **GitHub Repo:** https://github.com/KakaLovie/sinar-tani-mongo
- **Vercel Docs:** https://vercel.com/docs/environment-variables

---

## 📞 Support

Jika masih ada masalah:

1. **Check Vercel Logs**
   - Dashboard → Project → Deployments → View Logs

2. **Check MongoDB Logs**
   - Atlas → Logs

3. **Test Local First**
   ```bash
   npm start
   # Test di http://localhost:3000
   ```

4. **Contact Vercel Support**
   - https://vercel.com/help

---

**Last Updated:** 2026-02-26  
**Status:** ✅ Fixed - Ready to Deploy
