'use strict';
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'sinar_tani_dev_secret_ganti_di_production';

function _extractToken(req) {
    if (req.cookies?.token) return req.cookies.token;
    const auth = req.headers['authorization'];
    if (auth?.startsWith('Bearer ')) return auth.slice(7);
    return null;
}

function generateAccessToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email, nama: user.nama, peran: user.peran },
        JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
}

function requireAuth(req, res, next) {
    const token = _extractToken(req);
    if (!token) {
        if (req.path.startsWith('/api/') || req.xhr)
            return res.status(401).json({ sukses: false, pesan: 'Belum login.' });
        return res.redirect('/auth/login?redirect=' + encodeURIComponent(req.originalUrl));
    }
    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch {
        if (req.path.startsWith('/api/') || req.xhr)
            return res.status(401).json({ sukses: false, pesan: 'Token tidak valid.' });
        res.clearCookie('token');
        return res.redirect('/auth/login');
    }
}

function optionalAuth(req, res, next) {
    const token = _extractToken(req);
    if (token) {
        try { req.user = jwt.verify(token, JWT_SECRET); } catch {}
    }
    res.locals.user = req.user || null;
    next();
}

function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            if (req.path.startsWith('/api/') || req.xhr)
                return res.status(401).json({ sukses: false, pesan: 'Belum login.' });
            return res.redirect('/auth/login?redirect=' + encodeURIComponent(req.originalUrl));
        }
        if (!roles.includes(req.user.peran)) {
            if (req.path.startsWith('/api/') || req.xhr)
                return res.status(403).json({ sukses: false, pesan: 'Akses ditolak.' });
            return res.status(403).render('error', { message: 'Akses ditolak. Halaman ini hanya untuk ' + roles.join('/') + '.' });
        }
        next();
    };
}

module.exports = { requireAuth, optionalAuth, requireRole, generateAccessToken };
