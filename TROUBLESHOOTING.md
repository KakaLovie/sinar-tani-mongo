# 🔧 Troubleshooting Vercel 500 Error

## ✅ Yang Sudah Diperbaiki

1. ✅ Created `api/index.js` - Vercel serverless handler
2. ✅ Updated `server.js` - Prevent auto-start when imported
3. ✅ Updated `vercel.json` - Correct configuration
4. ✅ MongoDB connection caching - Prevent multiple connections
5. ✅ Error handling - Better error messages

## ⏳ Next Steps

### 1. Wait for Vercel Deployment
Deployment otomatis sudah berjalan. Tunggu 1-2 menit.

### 2. Check Deployment Status
1. Buka: https://vercel.com/dashboard
2. Lihat project "sinar-tani-mongo"
3. Check status: **Building** → **Ready**

### 3. Check Logs
Jika masih error setelah deployment:
1. Vercel Dashboard → Project → **Functions**
2. Klik function name
3. Tab **Logs**
4. Lihat error message

### 4. Common Issues & Solutions

#### Issue: MongoDB Connection Error
```
MongoServerError: bad auth
```
**Fix:**
- Check `MONGODB_URI` di Vercel Environment Variables
- Pastikan credentials benar
- Test connection string di MongoDB Atlas

#### Issue: IP Whitelist
```
MongoServerError: IP not whitelisted
```
**Fix:**
1. MongoDB Atlas → Network Access
2. Add IP: `0.0.0.0/0` (Allow from anywhere)
3. Save changes

#### Issue: Missing Environment Variables
```
MONGODB_URI is not defined
```
**Fix:**
1. Vercel Dashboard → Settings → Environment Variables
2. Add `MONGODB_URI` dengan value yang benar
3. Redeploy

#### Issue: Function Timeout
```
Function invocation timed out
```
**Fix:**
- Check `vercel.json` → `maxDuration: 30`
- Optimize database queries
- Check MongoDB performance

## 🎯 Quick Checklist

### Environment Variables (Vercel)
- [ ] `MONGODB_URI` = mongodb+srv://...
- [ ] `JWT_SECRET` = your_secret_key (optional)
- [ ] `NODE_ENV` = production (auto-set)

### MongoDB Atlas
- [ ] Database cluster active
- [ ] Network Access: 0.0.0.0/0
- [ ] Database user created
- [ ] Connection string tested

### Vercel Project
- [ ] Connected to GitHub repo
- [ ] Auto-deploy enabled
- [ ] Build settings default
- [ ] Root directory: ./

## 📱 Test After Deployment

1. **Homepage**: https://your-project.vercel.app/
   - Expected: Landing page with animations

2. **Login**: https://your-project.vercel.app/auth/login
   - Expected: Login form works

3. **Dashboard**: https://your-project.vercel.app/dashboard
   - Expected: Stats loading, no 500 error

4. **K-Map**: https://your-project.vercel.app/k-map
   - Expected: Map loads, markers appear

5. **Calculator**: https://your-project.vercel.app/kalkulator-tani
   - Expected: Calculator works, results show

## 🔍 Debug Mode

Jika masih ada masalah, enable debug logging:

1. Add to `server.js`:
```javascript
console.log('[DEBUG] Request:', req.method, req.path);
```

2. Push ke GitHub:
```bash
git add .
git commit -m "debug: add logging"
git push origin main
```

3. Check Vercel Logs untuk debug output

## 📞 Need Help?

1. **Vercel Logs**: Most important! Check error message
2. **MongoDB Logs**: Atlas → Logs
3. **GitHub Actions**: Check build logs
4. **Local Test**: `npm start` dulu di local

## 🎉 Success Indicators

Deployment berhasil jika:
- ✅ Homepage loads (no 500 error)
- ✅ Login works
- ✅ Dashboard shows stats
- ✅ Vercel status: "Ready"
- ✅ No errors in Vercel Logs

---

**Last Update:** 2026-02-26  
**Deployment Version:** 2.1.1  
**Status:** ⏳ Waiting for deployment...
