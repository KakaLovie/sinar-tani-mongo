'use strict';
require('dotenv').config();

const connectDB    = require('./connect');
const User         = require('../models/User');
const HamaLaporan  = require('../models/HamaLaporan');
const Produk       = require('../models/Produk');
const BantuanDinas = require('../models/BantuanDinas');

async function seed() {
    await connectDB();
    console.log('🌱 Mulai seeding data demo...');

    // Hapus data lama
    await Promise.all([User.deleteMany({}), HamaLaporan.deleteMany({}), Produk.deleteMany({}), BantuanDinas.deleteMany({})]);

    // Users
    const admin  = await User.create({ nama: 'Admin Sinar Tani', email: 'admin@demo.com',  password: 'admin1234', peran: 'admin',  provinsi: 'DKI Jakarta',  aktif: true });
    const kader  = await User.create({ nama: 'Budi Santoso',     email: 'kader@demo.com',  password: 'demo1234',  peran: 'kader',  provinsi: 'Jawa Barat',   kelompok_tani: 'Kelompok Tani Maju Jaya', aktif: true });
    const petani = await User.create({ nama: 'Siti Rahayu',      email: 'petani@demo.com', password: 'demo1234',  peran: 'petani', provinsi: 'Jawa Tengah',  aktif: true });
    const dinas  = await User.create({ nama: 'Dinas Pertanian Jabar', email: 'dinas@demo.com', password: 'demo1234', peran: 'dinas', provinsi: 'Jawa Barat', aktif: true });

    // Laporan Hama
    await HamaLaporan.insertMany([
        { user_id: kader._id,  jenis_hama: 'Wereng Batang Coklat', kategori_hama: 'serangga', tingkat_serangan: 'kritis',   komoditas_terdampak: 'Padi',   luas_terdampak: 5.5,  provinsi: 'Jawa Barat',   kabupaten: 'Subang',     latitude: -6.5654, longitude: 107.7594, status: 'aktif',     verified: true  },
        { user_id: petani._id, jenis_hama: 'Tikus Sawah',           kategori_hama: 'tikus',    tingkat_serangan: 'berat',    komoditas_terdampak: 'Padi',   luas_terdampak: 3.0,  provinsi: 'Jawa Tengah',  kabupaten: 'Demak',      latitude: -6.8942, longitude: 110.6325,status: 'aktif',     verified: false },
        { user_id: kader._id,  jenis_hama: 'Blas Padi',             kategori_hama: 'jamur',    tingkat_serangan: 'sedang',   komoditas_terdampak: 'Padi',   luas_terdampak: 2.0,  provinsi: 'Jawa Timur',   kabupaten: 'Jember',     latitude: -8.1845, longitude: 113.6690,status: 'ditangani', verified: true  },
        { user_id: petani._id, jenis_hama: 'Ulat Grayak',           kategori_hama: 'serangga', tingkat_serangan: 'ringan',   komoditas_terdampak: 'Jagung', luas_terdampak: 1.5,  provinsi: 'DI Yogyakarta',kabupaten: 'Bantul',     latitude: -7.9797, longitude: 110.3282,status: 'aktif',     verified: false },
        { user_id: kader._id,  jenis_hama: 'Kutu Daun',             kategori_hama: 'serangga', tingkat_serangan: 'sedang',   komoditas_terdampak: 'Cabai',  luas_terdampak: 0.8,  provinsi: 'Jawa Barat',   kabupaten: 'Garut',      latitude: -7.2118, longitude: 107.9010,status: 'aktif',     verified: true  },
        { user_id: admin._id,  jenis_hama: 'Busuk Batang',           kategori_hama: 'bakteri',  tingkat_serangan: 'berat',    komoditas_terdampak: 'Tomat',  luas_terdampak: 1.2,  provinsi: 'Sumatera Utara',kabupaten: 'Karo',      latitude: 3.1120,  longitude: 98.5070, status: 'aktif',     verified: true  },
        { user_id: petani._id, jenis_hama: 'Tungau Merah',           kategori_hama: 'serangga', tingkat_serangan: 'ringan',   komoditas_terdampak: 'Kedelai',luas_terdampak: 0.5,  provinsi: 'Jawa Tengah',  kabupaten: 'Wonogiri',   latitude: -7.8151, longitude: 110.9218,status: 'selesai',   verified: true  },
        { user_id: kader._id,  jenis_hama: 'Antraknosa',             kategori_hama: 'jamur',    tingkat_serangan: 'kritis',   komoditas_terdampak: 'Cabai',  luas_terdampak: 4.0,  provinsi: 'Jawa Barat',   kabupaten: 'Cianjur',    latitude: -6.8198, longitude: 107.1396,status: 'aktif',     verified: true  },
    ]);

    // Produk
    await Produk.insertMany([
        { user_id: petani._id, nama_produk: 'Beras Organik Premium', kategori: 'beras',    harga: 18000, satuan: 'kg',  stok: 500, provinsi: 'Jawa Tengah',  kabupaten: 'Klaten'  },
        { user_id: kader._id,  nama_produk: 'Cabai Merah Keriting',  kategori: 'sayuran',  harga: 42000, satuan: 'kg',  stok: 80,  provinsi: 'Jawa Barat',   kabupaten: 'Garut'   },
        { user_id: petani._id, nama_produk: 'Bawang Merah Segar',    kategori: 'sayuran',  harga: 28000, satuan: 'kg',  stok: 200, provinsi: 'Jawa Tengah',  kabupaten: 'Brebes'  },
        { user_id: kader._id,  nama_produk: 'Jagung Manis',          kategori: 'palawija', harga: 5000,  satuan: 'kg',  stok: 300, provinsi: 'Jawa Barat',   kabupaten: 'Majalengka'},
        { user_id: petani._id, nama_produk: 'Tomat Lokal Segar',     kategori: 'sayuran',  harga: 7500,  satuan: 'kg',  stok: 150, provinsi: 'Jawa Tengah',  kabupaten: 'Boyolali'},
    ]);

    // Bantuan
    await BantuanDinas.insertMany([
        { user_id: dinas._id, judul: 'Subsidi Pupuk NPK 2024', deskripsi: 'Program subsidi pupuk NPK untuk petani padi dan jagung terdaftar.', jenis_bantuan: 'pupuk', kuota: 200, syarat: 'Petani terdaftar, memiliki lahan min. 0.5 ha', provinsi: 'Jawa Barat',  tanggal_mulai: new Date('2024-01-01'), tanggal_selesai: new Date('2024-12-31') },
        { user_id: dinas._id, judul: 'Benih Padi Unggul Gratis', deskripsi: 'Distribusi benih padi varietas unggul Inpari 32 untuk musim tanam.', jenis_bantuan: 'benih', kuota: 150, syarat: 'Petani padi aktif, memiliki KTP', provinsi: 'Jawa Barat', tanggal_mulai: new Date('2024-02-01'), tanggal_selesai: new Date('2024-06-30') },
        { user_id: dinas._id, judul: 'Pelatihan GAP Hortikultura', deskripsi: 'Pelatihan Good Agricultural Practices untuk petani hortikultura.', jenis_bantuan: 'pelatihan', kuota: 50, syarat: 'Petani hortikultura aktif', provinsi: 'Jawa Tengah', tanggal_mulai: new Date('2024-03-01'), tanggal_selesai: new Date('2024-03-31') },
    ]);

    console.log('✅ Seed selesai!');
    console.log('');
    console.log('📧 Akun demo:');
    console.log('   admin@demo.com  / admin1234  (Admin)');
    console.log('   kader@demo.com  / demo1234   (Kader)');
    console.log('   petani@demo.com / demo1234   (Petani)');
    console.log('   dinas@demo.com  / demo1234   (Dinas)');
    process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
