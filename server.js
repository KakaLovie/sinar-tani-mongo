'use strict';
require('dotenv').config();

const express      = require('express');
const path         = require('path');
const cookieParser = require('cookie-parser');
const methodOvr    = require('method-override');
const helmet       = require('helmet');
const cors         = require('cors');
const rateLimit    = require('express-rate-limit');

const connectDB    = require('./database/connect');
const { optionalAuth, requireAuth, requireRole } = require('./middleware/auth');
const authRoutes   = require('./routes/auth');
const apiRoutes    = require('./routes/api');
const User         = require('./models/User');
const HamaLaporan  = require('./models/HamaLaporan');
const Produk       = require('./models/Produk');
const BantuanDinas = require('./models/BantuanDinas');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet({
    contentSecurityPolicy: false, // Disable for development, enable in production with proper config
    crossOriginEmbedderPolicy: false
}));
app.use(cors({ 
    origin: process.env.NODE_ENV === 'production' ? process.env.ALLOWED_ORIGIN : '*', 
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// ── Rate Limiting ─────────────────────────────────────────────────────────────
const apiLimiter  = rateLimit({ windowMs: 15*60*1000, max: 300, standardHeaders: true, legacyHeaders: false, message: { sukses: false, pesan: 'Terlalu banyak permintaan, coba lagi nanti.' } });
const authLimiter = rateLimit({ windowMs: 15*60*1000, max: 20, standardHeaders: true, legacyHeaders: false, message: { sukses: false, pesan: 'Terlalu banyak percobaan login, coba lagi nanti.' } });

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));

// Cookie parser with better error handling
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.error('[Cookie Parse Error]', err);
        return res.status(400).json({ sukses: false, pesan: 'Invalid request format.' });
    }
    next();
});

app.use(cookieParser());
app.use(methodOvr('_method'));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1d' }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('trust proxy', 1); // Trust first proxy

// ── Global template vars ───────────────────────────────────────────────────────
app.use(optionalAuth);
app.use((req, res, next) => {
    res.locals.appName = 'Sinar Tani';
    res.locals.tahun   = new Date().getFullYear();
    res.locals.user    = req.user || null;
    next();
});

// ── Routes ─────────────────────────────────────────────────────────────────────
app.use('/auth', authLimiter, authRoutes);
app.use('/api',  apiLimiter,  apiRoutes);

// ── Page Routes ────────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.render('landing'));
app.get('/dashboard', (req, res) => res.render('dashboard'));
app.get('/kalkulator-tani', (req, res) => res.render('kalkulator-tani'));
app.get('/k-map', (req, res) => res.render('k-map'));
app.get('/pasar-tani', (req, res) => res.render('pasar-tani'));
app.get('/kelas-tani', (req, res) => res.render('kelas-tani'));
app.get('/bantuan-dinas', (req, res) => res.render('bantuan-dinas'));

app.get('/profil', requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.render('profil', { profileUser: user });
    } catch (err) {
        console.error('[Profil Error]', err);
        res.redirect('/dashboard');
    }
});

// ── Admin Panel ─────────────────────────────────────────────────────────────────
app.get('/admin', requireAuth, requireRole('admin'), async (req, res) => {
    try {
        const [totalUsers, petani, kader, dinas, produk, hamaAktif, hamaKritis, hamaUnverified, bantuan, recentUsers, recentHama] = await Promise.all([
            User.countDocuments({ aktif: true }),
            User.countDocuments({ peran: 'petani', aktif: true }),
            User.countDocuments({ peran: 'kader',  aktif: true }),
            User.countDocuments({ peran: 'dinas',  aktif: true }),
            Produk.countDocuments({ aktif: true }),
            HamaLaporan.countDocuments({ status: 'aktif' }),
            HamaLaporan.countDocuments({ status: 'aktif', tingkat_serangan: 'kritis' }),
            HamaLaporan.countDocuments({ verified: false }),
            BantuanDinas.countDocuments({ aktif: true }),
            User.find().select('-password').sort({ created_at: -1 }).limit(20),
            HamaLaporan.find().populate('user_id','nama peran').sort({ created_at: -1 }).limit(15),
        ]);

        res.render('admin', {
            stats: { users: totalUsers, petani, kader, dinas, produk, hama_aktif: hamaAktif, hama_kritis: hamaKritis, hama_unverified: hamaUnverified, bantuan },
            recentUsers, recentHama
        });
    } catch (err) {
        console.error('[Admin Error]', err);
        res.render('error', { message: 'Gagal memuat panel admin.' });
    }
});

// ── 404 & Error handlers ───────────────────────────────────────────────────────
app.use((req, res) => {
    if (req.path.startsWith('/api/')) return res.status(404).json({ sukses: false, pesan: 'Endpoint tidak ditemukan.' });
    res.status(404).render('error', { message: 'Halaman tidak ditemukan.' });
});

app.use((err, req, res, next) => {
    console.error('[ERROR]', err.stack);
    
    // Handle specific error types
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ sukses: false, pesan: 'Token tidak valid.' });
    }
    if (err.name === 'ValidationError') {
        return res.status(400).json({ sukses: false, pesan: err.message });
    }
    
    const msg = process.env.NODE_ENV === 'production' ? 'Terjadi kesalahan server.' : err.message;
    if (req.path.startsWith('/api/')) return res.status(err.status||500).json({ sukses: false, pesan: msg });
    res.status(err.status||500).render('error', { message: msg });
});

// ── Start ──────────────────────────────────────────────────────────────────────
async function start() {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`
╔══════════════════════════════════════════════╗
║           🌾  SINAR TANI v2.0  🌾           ║
║   Platform Digital Rantai Pasok Pertanian    ║
╠══════════════════════════════════════════════╣
║  🚀  Server  : http://localhost:${PORT}         ║
║  🗄️  Database: MongoDB                       ║
╚══════════════════════════════════════════════╝`);
    });
}

start().catch(err => {
    console.error('[Startup Error]', err);
    process.exit(1);
});

// Export untuk Vercel
module.exports = app;
