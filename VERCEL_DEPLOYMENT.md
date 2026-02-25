# 🚀 Vercel Deployment Guide - Sinar Tani

## ✅ Fixes Applied for Vercel

### Problem: 500 INTERNAL_SERVER_ERROR
Error ini terjadi karena konfigurasi serverless Vercel tidak sesuai dengan struktur aplikasi Express + MongoDB.

### Solution Applied:

1. **Created `api/index.js`**
   - Handler untuk Vercel serverless function
   - Connect ke MongoDB sebelum process request
   - Error handling yang proper

2. **Updated `server.js`**
   - Added check `require.main === module` untuk mencegah auto-start saat di-import
   - Export app untuk digunakan Vercel

3. **Updated `vercel.json`**
   - Menggunakan `api/index.js` sebagai entry point
   - Set maxDuration 30 detik untuk serverless function
   - Configure environment variables

## 📁 File Structure for Vercel

```
sinar-tani-mongo/
├── api/
│   └── index.js          # Vercel serverless handler
├── server.js             # Express app (exported)
├── database/
│   └── connect.js        # MongoDB connection (cached)
├── views/                # EJS templates
├── public/               # Static files
├── routes/               # API routes
├── models/               # MongoDB models
├── middleware/           # Auth middleware
├── vercel.json           # Vercel configuration
└── package.json          # Dependencies
```

## 🔧 Configuration Files

### `vercel.json`
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "api/index.js"
    }
  ],
  "functions": {
    "api/index.js": {
      "maxDuration": 30
    }
  },
  "env": {
    "NODE_ENV": "production"
  }
}
```

### `api/index.js`
```javascript
const connectDB = require('../database/connect');
const app = require('../server');

module.exports = async (req, res) => {
    try {
        await connectDB();
        return app(req, res);
    } catch (error) {
        console.error('[Vercel Handler Error]', error);
        res.status(500).json({ 
            sukses: false, 
            pesan: 'Terjadi kesalahan server: ' + error.message 
        });
    }
};
```

## ⚙️ Environment Variables

Pastikan environment variables ini sudah di-set di Vercel:

1. **MONGODB_URI** (Required)
   - Contoh: `mongodb+srv://username:password@cluster.mongodb.net/sinar_tani`
   - Gunakan MongoDB Atlas untuk cloud database

2. **JWT_SECRET** (Optional - ada default)
   - Contoh: `your_super_secret_key_here`

3. **JWT_EXPIRES_IN** (Optional)
   - Default: `7d`

4. **NODE_ENV** (Auto-set by Vercel)
   - Production di Vercel
   - Development di local

### Cara Set Environment Variables di Vercel:

1. Buka [Vercel Dashboard](https://vercel.com/dashboard)
2. Pilih project Sinar Tani
3. Klik **Settings** → **Environment Variables**
4. Add variables:
   - `MONGODB_URI` = your MongoDB connection string
   - `JWT_SECRET` = your secret key
5. Klik **Save**

## 📝 Deployment Steps

### 1. Push ke GitHub
```bash
git add .
git commit -m "fix: vercel configuration"
git push origin main
```

### 2. Vercel Auto-Deploy
- Vercel akan otomatis detect push baru
- Tunggu build selesai (~1-2 menit)
- Check logs di Vercel Dashboard

### 3. Check Deployment
- Buka https://your-project.vercel.app
- Test semua fitur:
  - ✅ Login/Register
  - ✅ Dashboard
  - ✅ Kalkulator Tani
  - ✅ K-Map
  - ✅ Pasar Tani

## 🐛 Troubleshooting

### Error: FUNCTION_INVOCATION_FAILED
**Penyebab:**
- MongoDB connection string salah
- Database tidak accessible
- Timeout (>30 detik)

**Solusi:**
1. Check MONGODB_URI di Vercel Environment Variables
2. Pastikan MongoDB Atlas accessible dari semua IP (0.0.0.0/0)
3. Check Vercel logs untuk error detail

### Error: 500 Internal Server Error
**Penyebab:**
- Missing dependencies
- File path salah
- EJS template error

**Solusi:**
1. Check `package.json` semua dependencies ada
2. Check logs di Vercel Dashboard → Functions → Logs
3. Test local dulu dengan `npm start`

### Error: MongoDB Connection Timeout
**Penyebab:**
- MongoDB Atlas IP whitelist tidak include Vercel
- Network whitelist terlalu restrictive

**Solusi:**
1. Buka MongoDB Atlas → Network Access
2. Add IP Address: `0.0.0.0/0` (Allow from anywhere)
3. Atau add Vercel function IP ranges

### Error: Module Not Found
**Penyebab:**
- Dependencies tidak ter-install
- File path case-sensitive

**Solusi:**
1. Pastikan semua dependencies di `package.json`
2. Check import paths (case-sensitive di Linux)
3. Run `npm install` local untuk verify

## 🔍 Check Logs di Vercel

1. **Vercel Dashboard** → Project → **Functions**
2. Klik function yang error
3. Lihat **Logs** tab
4. Filter by deployment atau time range

### Common Log Messages:

```
[MongoDB] Terhubung ke: mongodb+srv://***@cluster.mongodb.net/sinar_tani
✅ Success - Function executed successfully
```

```
❌ Error - [Vercel Handler Error] MongoServerError: bad auth
   → Check MongoDB credentials
```

```
❌ Error - Cannot find module 'xxx'
   → Add dependency to package.json
```

## 📊 Performance Optimization

### 1. Database Connection Caching
File `database/connect.js` sudah implement connection caching:
```javascript
let cached = global._mongoose;
if (!cached) cached = global._mongoose = { conn: null, promise: null };
```
Ini mencegah multiple connections untuk setiap request.

### 2. Static Files
File di `public/` akan di-cache oleh Vercel CDN automatically.

### 3. Function Duration
- Default maxDuration: 10 detik
- Pro plan: bisa set sampai 60 detik
- Set di `vercel.json`: `"maxDuration": 30`

## 🎯 Post-Deployment Checklist

- [ ] Environment variables sudah di-set
- [ ] MongoDB Atlas IP whitelist (0.0.0.0/0)
- [ ] Test login/register
- [ ] Test dashboard loading
- [ ] Test kalkulator tani
- [ ] Test K-Map data loading
- [ ] Test all API endpoints
- [ ] Check Vercel logs untuk errors
- [ ] Verify SSL certificate (automatic di Vercel)

## 📞 Support

Jika masih ada masalah:
1. Check [Vercel Documentation](https://vercel.com/docs)
2. Check [Vercel Node.js Functions](https://vercel.com/docs/functions/serverless-functions/runtimes/node-js)
3. Review Vercel logs untuk error detail
4. Test local dengan `npm start` dulu

---

**Last Updated:** 2026-02-26  
**Status:** ✅ Deployed & Working  
**Version:** 2.1.1
