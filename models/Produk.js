'use strict';
const mongoose = require('mongoose');

const produkSchema = new mongoose.Schema({
    user_id     : { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    nama_produk : { type: String, required: true, trim: true },
    kategori    : { type: String, enum: ['sayuran','buah','beras','palawija','rempah','lainnya'], default: 'lainnya' },
    harga       : { type: Number, required: true },
    satuan      : { type: String, default: 'kg' },
    stok        : { type: Number, default: 0 },
    deskripsi   : { type: String, default: '' },
    foto        : { type: String, default: null },
    provinsi    : { type: String, default: null },
    kabupaten   : { type: String, default: null },
    aktif       : { type: Boolean, default: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.models.Produk || mongoose.model('Produk', produkSchema);
