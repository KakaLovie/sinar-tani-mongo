const connectDB = require('../database/connect');
const app = require('../server');

// Vercel serverless function handler
module.exports = async (req, res) => {
    try {
        // Connect to MongoDB
        await connectDB();
        
        // Pass request to Express app
        return app(req, res);
    } catch (error) {
        console.error('[Vercel Handler Error]', error);
        res.status(500).json({ 
            sukses: false, 
            pesan: 'Terjadi kesalahan server: ' + error.message 
        });
    }
};
