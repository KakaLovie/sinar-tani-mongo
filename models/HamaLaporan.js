'use strict';
const mongoose = require('mongoose');

const hamaSchema = new mongoose.Schema({
    user_id           : { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    jenis_hama        : { type: String, required: true, trim: true },
    kategori_hama     : { type: String, enum: ['serangga','tikus','jamur','bakteri','virus','lainnya'], required: true },
    tingkat_serangan  : { type: String, enum: ['ringan','sedang','berat','kritis'], required: true },
    komoditas_terdampak: { type: String, required: true },
    luas_terdampak    : { type: Number, default: null },
    deskripsi         : { type: String, default: '' },
    foto_bukti        : { type: String, default: null },
    provinsi          : { type: String, default: null },
    kabupaten         : { type: String, default: null },
    kecamatan         : { type: String, default: null },
    desa              : { type: String, default: null },
    latitude          : { type: Number, default: null },
    longitude         : { type: Number, default: null },
    status            : { type: String, enum: ['aktif','ditangani','selesai'], default: 'aktif' },
    catatan_dinas     : { type: String, default: null },
    verified          : { type: Boolean, default: false },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

hamaSchema.index({ status: 1 });
hamaSchema.index({ provinsi: 1 });
hamaSchema.index({ latitude: 1, longitude: 1 });

module.exports = mongoose.models.HamaLaporan || mongoose.model('HamaLaporan', hamaSchema);
