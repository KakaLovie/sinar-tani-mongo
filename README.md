# 🌾 Sinar Tani v2.0

Platform Digital Rantai Pasok Pertanian Indonesia

---

## 📋 Fitur

- 🛰️ **Radar Hama** – Laporan & peta serangan hama real-time
- 🛒 **Pasar Tani** – Jual beli komoditas pertanian
- 💰 **Monitor Harga** – Harga komoditas terkini dari Badan Pangan
- 🏛️ **Bantuan Dinas** – Program subsidi & bantuan pemerintah
- 📚 **Kelas Tani** – Materi edukasi pertanian
- 🧮 **Kalkulator Tani** – Hitung HPP, pupuk, hasil panen
- 👑 **Panel Admin** – Kelola pengguna & konten

---

## 🚀 Cara Menjalankan Lokal

### 1. Siapkan MongoDB

**Opsi A – MongoDB Atlas (gratis, tanpa install):**
1. Daftar di [mongodb.com/atlas](https://mongodb.com/atlas)
2. Buat cluster gratis (M0)
3. Buat database user
4. Whitelist IP: `0.0.0.0/0`
5. Copy connection string → masukkan ke `.env`

**Opsi B – MongoDB lokal:**
```bash
# Install MongoDB Community
# https://www.mongodb.com/try/download/community
# Lalu jalankan:
mongod
```

### 2. Install & Jalankan

```bash
# Clone / extract project
cd sinar-tani

# Install dependencies
npm install

# Buat file .env (dari contoh)
cp .env.example .env
# Edit .env → isi MONGODB_URI dan JWT_SECRET

# Isi data demo (opsional)
npm run seed

# Jalankan server
npm start
# atau untuk development (auto-restart):
npm run dev
```

Buka browser: **http://localhost:3000**

### 3. Akun Demo (setelah npm run seed)

| Email | Password | Peran |
|-------|----------|-------|
| admin@demo.com | admin1234 | Admin |
| kader@demo.com | demo1234 | Kader |
| petani@demo.com | demo1234 | Petani |
| dinas@demo.com | demo1234 | Dinas |

---

## ☁️ Deploy ke Vercel

### 1. Siapkan MongoDB Atlas
(Ikuti langkah di atas, gunakan connection string Atlas)

### 2. Upload ke GitHub
```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/username/sinar-tani.git
git push -u origin main
```

### 3. Deploy di Vercel
1. Daftar/login di [vercel.com](https://vercel.com)
2. Klik **New Project** → Import dari GitHub
3. Pilih repo `sinar-tani`
4. Di **Environment Variables**, tambahkan:
   - `MONGODB_URI` = connection string Atlas kamu
   - `JWT_SECRET` = string panjang dan acak
   - `NODE_ENV` = production
5. Klik **Deploy**

Selesai! Dapat URL seperti: `https://sinar-tani.vercel.app`

---

## 📁 Struktur Folder

```
sinar-tani/
├── server.js              ← Entry point
├── package.json
├── vercel.json            ← Konfigurasi Vercel
├── .env.example
├── database/
│   ├── connect.js         ← Koneksi MongoDB
│   └── seed.js            ← Data demo
├── models/
│   ├── User.js
│   ├── HamaLaporan.js
│   ├── Produk.js
│   └── BantuanDinas.js
├── middleware/
│   └── auth.js            ← JWT middleware
├── routes/
│   ├── api.js             ← Semua API endpoint
│   └── auth.js            ← Login/register
├── views/
│   ├── partials/sidebar.ejs
│   ├── auth/login.ejs
│   ├── auth/register.ejs
│   ├── landing.ejs
│   ├── dashboard.ejs
│   ├── k-map.ejs
│   ├── admin.ejs
│   ├── profil.ejs
│   ├── pasar-tani.ejs
│   ├── kelas-tani.ejs
│   ├── kalkulator-tani.ejs
│   ├── bantuan-dinas.ejs
│   └── error.ejs
└── public/
    ├── css/
    ├── js/
    └── images/
```

---

## 🔑 Generate JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy outputnya ke `.env` sebagai nilai `JWT_SECRET`.
