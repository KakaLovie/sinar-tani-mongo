'use strict';
const express  = require('express');
const User     = require('../models/User');
const { generateAccessToken } = require('../middleware/auth');
const router   = express.Router();

// Cookie options optimized for Vercel
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure  : process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge  : 7 * 24 * 60 * 60 * 1000, // 7 days
    path    : '/'
};

// GET /auth/register
router.get('/register', (req, res) => {
    res.render('auth/register', { error: null, form: {} });
});

// POST /auth/register
router.post('/register', async (req, res) => {
    try {
        const { nama, email, password, konfirmasi_password, peran, provinsi, kabupaten, no_hp, kelompok_tani } = req.body;
        const errors = [];

        // Validation
        if (!nama?.trim() || nama.trim().length < 2) {
            errors.push('Nama minimal 2 karakter.');
        }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push('Format email tidak valid.');
        }
        if (!password || password.length < 8) {
            errors.push('Password minimal 8 karakter.');
        }
        if (password !== konfirmasi_password) {
            errors.push('Konfirmasi password tidak cocok.');
        }
        if (!['petani','kader','dinas'].includes(peran)) {
            errors.push('Peran tidak valid.');
        }
        if (peran === 'kader' && !kelompok_tani?.trim()) {
            errors.push('Nama kelompok tani wajib untuk Kader.');
        }

        if (errors.length > 0) {
            return res.render('auth/register', { 
                error: errors.join(' '), 
                form: req.body 
            });
        }

        // Check if email already exists
        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) {
            return res.render('auth/register', { 
                error: 'Email sudah terdaftar.', 
                form: req.body 
            });
        }

        // Create user
        const user = await User.create({
            nama: nama.trim(),
            email: email.toLowerCase(),
            password,
            peran,
            provinsi: provinsi || null,
            kabupaten: kabupaten || null,
            no_hp: no_hp || null,
            kelompok_tani: peran === 'kader' ? (kelompok_tani?.trim() || null) : null,
        });

        // Generate token
        const token = generateAccessToken(user);

        // Set cookie with proper options for Vercel
        res.cookie('token', token, COOKIE_OPTIONS);

        // Redirect to dashboard
        res.redirect('/dashboard');
    } catch (err) {
        console.error('[REGISTER ERROR]', err);
        res.render('auth/register', {
            error: 'Terjadi kesalahan saat mendaftar. Silakan coba lagi.',
            form: req.body
        });
    }
});

// GET /auth/login
router.get('/login', (req, res) => {
    const redirect = req.query.redirect || req.query.redirectUrl || '/dashboard';
    res.render('auth/login', { error: null, redirect });
});

// POST /auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password, redirect } = req.body;
        const redirectUrl = redirect || '/dashboard';

        // Validation
        if (!email || !password) {
            return res.render('auth/login', {
                error: 'Email dan password wajib diisi.',
                redirect: redirectUrl
            });
        }

        // Find user
        const user = await User.findOne({ email: email.toLowerCase(), aktif: true });
        if (!user) {
            return res.render('auth/login', {
                error: 'Email atau password salah.',
                redirect: redirectUrl
            });
        }

        // Verify password
        const valid = await user.cekPassword(password);
        if (!valid) {
            return res.render('auth/login', {
                error: 'Email atau password salah.',
                redirect: redirectUrl
            });
        }

        // Generate token
        const token = generateAccessToken(user);

        // Set cookie
        res.cookie('token', token, COOKIE_OPTIONS);

        // Safe redirect
        const safeRedirect = redirectUrl.startsWith('/') && !redirectUrl.startsWith('//') 
            ? redirectUrl 
            : '/dashboard';
        
        res.redirect(safeRedirect);
    } catch (err) {
        console.error('[LOGIN ERROR]', err);
        res.render('auth/login', {
            error: 'Terjadi kesalahan server. Silakan coba lagi.',
            redirect: req.body.redirect || '/dashboard'
        });
    }
});

// POST /auth/logout
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
});

// GET /auth/me
router.get('/me', (req, res) => {
    if (!req.user) {
        return res.status(401).json({ sukses: false, pesan: 'Belum login.' });
    }
    res.json({ sukses: true, data: req.user });
});

module.exports = router;
