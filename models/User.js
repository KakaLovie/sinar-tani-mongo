'use strict';
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    nama          : { type: String, required: true, trim: true },
    email         : { type: String, required: true, unique: true, lowercase: true, trim: true },
    password      : { type: String, required: true, minlength: 8 },
    peran         : { type: String, enum: ['admin','petani','kader','dinas'], default: 'petani' },
    provinsi      : { type: String, default: null },
    kabupaten     : { type: String, default: null },
    no_hp         : { type: String, default: null },
    kelompok_tani : { type: String, default: null },  // khusus kader
    foto_profil   : { type: String, default: null },
    aktif         : { type: Boolean, default: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

// Hash password sebelum simpan
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Method verifikasi password
userSchema.methods.cekPassword = function(plain) {
    return bcrypt.compare(plain, this.password);
};

// Jangan expose password di JSON response
userSchema.methods.toJSON = function() {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
