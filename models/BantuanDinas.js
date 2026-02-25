'use strict';
const mongoose = require('mongoose');

const bantuanSchema = new mongoose.Schema({
    user_id        : { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    judul          : { type: String, required: true, trim: true },
    deskripsi      : { type: String, required: true },
    jenis_bantuan  : { type: String, enum: ['pupuk','benih','alat','pelatihan','modal','lainnya'], default: 'lainnya' },
    kuota          : { type: Number, default: null },
    syarat         : { type: String, default: '' },
    kontak         : { type: String, default: '' },
    provinsi       : { type: String, default: null },
    kabupaten      : { type: String, default: null },
    tanggal_mulai  : { type: Date, default: null },
    tanggal_selesai: { type: Date, default: null },
    aktif          : { type: Boolean, default: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.models.BantuanDinas || mongoose.model('BantuanDinas', bantuanSchema);
