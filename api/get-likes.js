// api/get-likes.js
const { createClient } = require('@libsql/client');

// --- DEBUGGING STEP ---
// Log the environment variables to see what Vercel is actually using.
const dbUrl = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

console.log("--- Get Likes Function ---");
console.log("TURSO_DATABASE_URL Loaded:", !!dbUrl);
console.log("TURSO_AUTH_TOKEN Loaded:", !!authToken);
if (dbUrl) {
    console.log("URL starts with:", dbUrl.substring(0, 15));
}

module.exports = async (req, res) => {
    // Check if variables are missing and return a clear error
    if (!dbUrl || !authToken) {
        console.error("Database credentials are not configured in Vercel environment variables.");
        return res.status(500).json({ error: "Server configuration error." });
    }

    const db = createClient({
        url: dbUrl,
        authToken: authToken,
    });

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 'no-cache');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { slug } = req.query;
    if (!slug) {
        return res.status(400).json({ error: 'Slug is required' });
    }

    try {
        const rs = await db.execute({
            sql: 'SELECT count FROM likes WHERE slug = ?',
            args: [slug],
        });
        const count = rs.rows.length > 0 ? rs.rows[0].count : 0;
        return res.status(200).json({ count });
    } catch (e) {
        console.error('Failed to fetch likes:', e);
        return res.status(500).json({ error: 'Failed to fetch likes' });
    }
};
