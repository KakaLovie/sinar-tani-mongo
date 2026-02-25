const connectDB = require('../database/connect');
const app = require('../server');

// Vercel serverless function handler
module.exports = async (req, res) => {
    // Set proper headers for cookies and CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.setHeader('Set-Cookie', 'path=/; Secure; SameSite=Lax');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // Connect to MongoDB with timeout
        await Promise.race([
            connectDB(),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('MongoDB connection timeout')), 10000)
            )
        ]);

        // Add request logging
        console.log(`[Vercel] ${req.method} ${req.path}`);

        // Pass request to Express app
        return app(req, res);
    } catch (error) {
        console.error('[Vercel Handler Error]', error);
        
        // Send proper error response
        res.status(500).json({
            sukses: false,
            pesan: 'Terjadi kesalahan server. Silakan coba lagi.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
