'use strict';
const express       = require('express');
const fetch         = require('node-fetch');
const User          = require('../models/User');
const HamaLaporan   = require('../models/HamaLaporan');
const Produk        = require('../models/Produk');
const BantuanDinas  = require('../models/BantuanDinas');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// ═══════════════════════════════════════════════════════════
// STATISTIK
// ═══════════════════════════════════════════════════════════
router.get('/statistik', async (req, res) => {
    try {
        const [total_petani, total_produk, total_bantuan, hama_aktif, hama_kritis] = await Promise.all([
            User.countDocuments({ aktif: true }),
            Produk.countDocuments({ aktif: true }),
            BantuanDinas.countDocuments({ aktif: true }),
            HamaLaporan.countDocuments({ status: 'aktif' }),
            HamaLaporan.countDocuments({ status: 'aktif', tingkat_serangan: 'kritis' }),
        ]);
        res.json({ sukses: true, data: { total_petani, total_produk, total_bantuan, total_komoditas: 24, hama_aktif, hama_kritis } });
    } catch (err) {
        res.status(500).json({ sukses: false, pesan: err.message });
    }
});

// ═══════════════════════════════════════════════════════════
// HARGA (proxy ke API Badan Pangan)
// ═══════════════════════════════════════════════════════════
router.get('/harga/terkini', async (req, res) => {
    try {
        const r = await fetch('https://panelharga.badanpangan.go.id/api/v2/komoditas', { timeout: 5000 });
        if (!r.ok) throw new Error('API tidak tersedia');
        const data = await r.json();
        res.json({ sukses: true, data });
    } catch {
        // Fallback data statis
        res.json({ sukses: true, data: [
            { nama: 'Beras Medium',    harga: 13500, satuan: 'kg', perubahan: 0.5  },
            { nama: 'Cabai Merah',     harga: 45000, satuan: 'kg', perubahan: -2.1 },
            { nama: 'Bawang Merah',    harga: 32000, satuan: 'kg', perubahan: 1.2  },
            { nama: 'Tomat',           harga: 8000,  satuan: 'kg', perubahan: -0.8 },
            { nama: 'Jagung',          harga: 6500,  satuan: 'kg', perubahan: 0.3  },
            { nama: 'Kedelai',         harga: 11000, satuan: 'kg', perubahan: 0.0  },
            { nama: 'Gula Pasir',      harga: 17500, satuan: 'kg', perubahan: 0.0  },
            { nama: 'Minyak Goreng',   harga: 19000, satuan: 'L',  perubahan: -0.5 },
        ]});
    }
});

// ═══════════════════════════════════════════════════════════
// RADAR HAMA
// ═══════════════════════════════════════════════════════════

// GET /api/hama - list laporan dengan filter
router.get('/hama', async (req, res) => {
    try {
        const { status, kategori, tingkat, provinsi, limit = 50 } = req.query;
        const filter = {};
        if (status)   filter.status = status;
        if (kategori) filter.kategori_hama = kategori;
        if (tingkat)  filter.tingkat_serangan = tingkat;
        if (provinsi) filter.provinsi = new RegExp(provinsi, 'i');

        const laporan = await HamaLaporan.find(filter)
            .populate('user_id', 'nama peran kelompok_tani')
            .sort({ created_at: -1 })
            .limit(Number(limit));

        res.json({ sukses: true, data: laporan });
    } catch (err) {
        res.status(500).json({ sukses: false, pesan: err.message });
    }
});

// GET /api/hama/peta - untuk marker di peta (hanya yang punya koordinat)
router.get('/hama/peta', async (req, res) => {
    try {
        const laporan = await HamaLaporan.find({
            status    : { $ne: 'selesai' },
            latitude  : { $ne: null },
            longitude : { $ne: null },
        })
        .populate('user_id', 'nama peran')
        .sort({ created_at: -1 });

        res.json({ sukses: true, data: laporan });
    } catch (err) {
        res.status(500).json({ sukses: false, pesan: err.message });
    }
});

// GET /api/hama/statistik - dashboard stats
router.get('/hama/statistik', async (req, res) => {
    try {
        const [total_aktif, total_kritis, total_laporan, perKategori, perTingkat, hotspot] = await Promise.all([
            HamaLaporan.countDocuments({ status: 'aktif' }),
            HamaLaporan.countDocuments({ status: 'aktif', tingkat_serangan: 'kritis' }),
            HamaLaporan.countDocuments(),
            HamaLaporan.aggregate([{ $group: { _id: '$kategori_hama', total: { $sum: 1 } } }]),
            HamaLaporan.aggregate([{ $group: { _id: '$tingkat_serangan', total: { $sum: 1 } } }]),
            HamaLaporan.aggregate([
                { $match: { status: { $ne: 'selesai' } } },
                { $group: { _id: '$provinsi', total: { $sum: 1 } } },
                { $sort: { total: -1 } },
                { $limit: 5 },
            ]),
        ]);

        const terbaru = await HamaLaporan.find()
            .populate('user_id', 'nama peran')
            .sort({ created_at: -1 })
            .limit(5);

        res.json({ sukses: true, data: { total_aktif, total_kritis, total_laporan, per_kategori: perKategori, per_tingkat: perTingkat, hotspot_provinsi: hotspot, terbaru } });
    } catch (err) {
        res.status(500).json({ sukses: false, pesan: err.message });
    }
});

// POST /api/hama - buat laporan baru
router.post('/hama', requireAuth, async (req, res) => {
    try {
        const { jenis_hama, kategori_hama, tingkat_serangan, komoditas_terdampak, luas_terdampak, deskripsi, provinsi, kabupaten, kecamatan, desa, latitude, longitude } = req.body;

        if (!jenis_hama || !kategori_hama || !tingkat_serangan || !komoditas_terdampak)
            return res.status(400).json({ sukses: false, pesan: 'Field wajib tidak lengkap.' });

        const autoVerified = ['kader','admin'].includes(req.user.peran);

        const laporan = await HamaLaporan.create({
            user_id: req.user.id,
            jenis_hama, kategori_hama, tingkat_serangan, komoditas_terdampak,
            luas_terdampak: luas_terdampak || null,
            deskripsi: deskripsi || '',
            provinsi: provinsi || null, kabupaten: kabupaten || null,
            kecamatan: kecamatan || null, desa: desa || null,
            latitude: latitude ? Number(latitude) : null,
            longitude: longitude ? Number(longitude) : null,
            verified: autoVerified,
        });

        res.json({ sukses: true, pesan: autoVerified ? 'Laporan berhasil ditambahkan (terverifikasi).' : 'Laporan dikirim, menunggu verifikasi.', data: laporan });
    } catch (err) {
        res.status(500).json({ sukses: false, pesan: err.message });
    }
});

// PATCH /api/hama/:id/status
router.patch('/hama/:id/status', requireAuth, requireRole('admin','dinas','kader'), async (req, res) => {
    try {
        const { status, catatan_dinas } = req.body;
        if (!['aktif','ditangani','selesai'].includes(status))
            return res.status(400).json({ sukses: false, pesan: 'Status tidak valid.' });

        const laporan = await HamaLaporan.findByIdAndUpdate(
            req.params.id,
            { status, catatan_dinas: catatan_dinas || null },
            { new: true }
        );
        if (!laporan) return res.status(404).json({ sukses: false, pesan: 'Laporan tidak ditemukan.' });

        res.json({ sukses: true, pesan: 'Status diperbarui.', data: laporan });
    } catch (err) {
        res.status(500).json({ sukses: false, pesan: err.message });
    }
});

// PATCH /api/hama/:id/verifikasi
router.patch('/hama/:id/verifikasi', requireAuth, requireRole('admin','kader'), async (req, res) => {
    try {
        const laporan = await HamaLaporan.findByIdAndUpdate(req.params.id, { verified: true }, { new: true });
        if (!laporan) return res.status(404).json({ sukses: false, pesan: 'Laporan tidak ditemukan.' });
        res.json({ sukses: true, pesan: 'Laporan terverifikasi.', data: laporan });
    } catch (err) {
        res.status(500).json({ sukses: false, pesan: err.message });
    }
});

// DELETE /api/hama/:id
router.delete('/hama/:id', requireAuth, async (req, res) => {
    try {
        const laporan = await HamaLaporan.findById(req.params.id);
        if (!laporan) return res.status(404).json({ sukses: false, pesan: 'Tidak ditemukan.' });

        const isOwner = laporan.user_id.toString() === req.user.id;
        if (!isOwner && req.user.peran !== 'admin')
            return res.status(403).json({ sukses: false, pesan: 'Tidak diizinkan.' });

        await laporan.deleteOne();
        res.json({ sukses: true, pesan: 'Laporan dihapus.' });
    } catch (err) {
        res.status(500).json({ sukses: false, pesan: err.message });
    }
});

// ═══════════════════════════════════════════════════════════
// PRODUK (Pasar Tani)
// ═══════════════════════════════════════════════════════════
router.get('/produk', async (req, res) => {
    try {
        const { kategori, provinsi, limit = 20 } = req.query;
        const filter = { aktif: true };
        if (kategori) filter.kategori = kategori;
        if (provinsi) filter.provinsi = new RegExp(provinsi, 'i');

        const produk = await Produk.find(filter)
            .populate('user_id', 'nama provinsi no_hp')
            .sort({ created_at: -1 })
            .limit(Number(limit));

        // Transform data to match frontend expectations
        const transformedProduk = produk.map(p => ({
            id: p._id,
            nama: p.nama_produk,
            nama_produk: p.nama_produk,
            kategori: p.kategori,
            harga: p.harga,
            satuan: p.satuan,
            stok: p.stok,
            deskripsi: p.deskripsi,
            provinsi: p.provinsi,
            kabupaten: p.kabupaten,
            nama_penjual: p.user_id?.nama || 'Petani',
            lokasi: p.provinsi || p.user_id?.provinsi || 'Indonesia',
            no_hp_penjual: p.user_id?.no_hp || '',
            aktif: p.aktif,
            created_at: p.created_at,
        }));

        res.json({ sukses: true, data: transformedProduk });
    } catch (err) {
        res.status(500).json({ sukses: false, pesan: err.message });
    }
});

router.post('/produk', requireAuth, async (req, res) => {
    try {
        const { nama_produk, kategori, harga, satuan, stok, deskripsi, provinsi, kabupaten } = req.body;
        if (!nama_produk || !harga)
            return res.status(400).json({ sukses: false, pesan: 'Nama produk dan harga wajib diisi.' });

        const produk = await Produk.create({
            user_id: req.user.id,
            nama_produk, kategori, harga: Number(harga),
            satuan: satuan || 'kg',
            stok: stok ? Number(stok) : 0,
            deskripsi: deskripsi || '',
            provinsi: provinsi || null, kabupaten: kabupaten || null,
        });
        res.json({ sukses: true, pesan: 'Produk berhasil ditambahkan.', data: produk });
    } catch (err) {
        res.status(500).json({ sukses: false, pesan: err.message });
    }
});

// ═══════════════════════════════════════════════════════════
// BANTUAN DINAS
// ═══════════════════════════════════════════════════════════
router.get('/bantuan', async (req, res) => {
    try {
        const bantuan = await BantuanDinas.find({ aktif: true })
            .populate('user_id', 'nama provinsi')
            .sort({ created_at: -1 });

        // Transform data to match frontend expectations
        const transformedBantuan = bantuan.map(b => ({
            id: b._id,
            judul: b.judul,
            deskripsi: b.deskripsi,
            jenis: b.jenis_bantuan,
            jenis_bantuan: b.jenis_bantuan,
            kuota: b.kuota,
            syarat: b.syarat,
            kontak: b.kontak || '',
            provinsi: b.provinsi,
            kabupaten: b.kabupaten,
            tanggal_mulai: b.tanggal_mulai,
            tanggal_selesai: b.tanggal_selesai,
            aktif: b.aktif,
            created_at: b.created_at,
        }));

        res.json({ sukses: true, data: transformedBantuan });
    } catch (err) {
        res.status(500).json({ sukses: false, pesan: err.message });
    }
});

router.post('/bantuan', requireAuth, requireRole('admin','dinas'), async (req, res) => {
    try {
        const { judul, deskripsi, jenis_bantuan, jenis, kuota, syarat, kontak, provinsi, kabupaten, tanggal_mulai, tanggal_selesai } = req.body;
        if (!judul || !deskripsi)
            return res.status(400).json({ sukses: false, pesan: 'Judul dan deskripsi wajib diisi.' });

        const bantuan = await BantuanDinas.create({
            user_id: req.user.id,
            judul,
            deskripsi,
            jenis_bantuan: jenis_bantuan || jenis || 'lainnya',
            kuota: kuota ? Number(kuota) : null,
            syarat: syarat || '',
            kontak: kontak || '',
            provinsi: provinsi || null,
            kabupaten: kabupaten || null,
            tanggal_mulai: tanggal_mulai || null,
            tanggal_selesai: tanggal_selesai || null,
        });
        res.json({ sukses: true, pesan: 'Program bantuan ditambahkan.', data: bantuan });
    } catch (err) {
        res.status(500).json({ sukses: false, pesan: err.message });
    }
});

// ═══════════════════════════════════════════════════════════
// ADMIN
// ═══════════════════════════════════════════════════════════
router.get('/admin/users', requireAuth, requireRole('admin'), async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ created_at: -1 });
        res.json({ sukses: true, data: users });
    } catch (err) {
        res.status(500).json({ sukses: false, pesan: err.message });
    }
});

router.patch('/admin/users/:id', requireAuth, requireRole('admin'), async (req, res) => {
    try {
        const { aktif, peran } = req.body;
        const update = {};
        if (aktif !== undefined) update.aktif = Boolean(aktif);
        if (peran && ['petani','kader','dinas','admin'].includes(peran)) update.peran = peran;

        const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password');
        if (!user) return res.status(404).json({ sukses: false, pesan: 'User tidak ditemukan.' });
        res.json({ sukses: true, pesan: 'User diperbarui.', data: user });
    } catch (err) {
        res.status(500).json({ sukses: false, pesan: err.message });
    }
});

// GET /api/profil - update profil user
router.patch('/profil', requireAuth, async (req, res) => {
    try {
        const { nama, provinsi, kabupaten, no_hp, kelompok_tani } = req.body;
        const update = {};
        if (nama)          update.nama = nama.trim();
        if (provinsi)      update.provinsi = provinsi;
        if (kabupaten)     update.kabupaten = kabupaten;
        if (no_hp)         update.no_hp = no_hp;
        if (kelompok_tani) update.kelompok_tani = kelompok_tani;

        const user = await User.findByIdAndUpdate(req.user.id, update, { new: true }).select('-password');
        res.json({ sukses: true, pesan: 'Profil diperbarui.', data: user });
    } catch (err) {
        res.status(500).json({ sukses: false, pesan: err.message });
    }
});

module.exports = router;
