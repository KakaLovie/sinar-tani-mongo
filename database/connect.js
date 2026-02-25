'use strict';
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sinar_tani';

// Cache koneksi untuk Vercel serverless (agar tidak buat koneksi baru setiap request)
let cached = global._mongoose;
if (!cached) cached = global._mongoose = { conn: null, promise: null };

async function connectDB() {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI, {
            bufferCommands: false,
        }).then(m => {
            console.log(`[MongoDB] Terhubung ke: ${MONGODB_URI.replace(/:([^@]+)@/, ':***@')}`);
            return m;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (err) {
        cached.promise = null;
        throw err;
    }

    return cached.conn;
}

module.exports = connectDB;
