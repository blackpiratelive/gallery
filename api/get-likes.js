// api/get-likes.js

const { createClient } = require('@libsql/client');

// Initialize the Turso DB client using environment variables
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

module.exports = async (req, res) => {
  // Set headers for CORS and to prevent caching
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // This function only handles GET requests
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

    // If no row exists, the count is 0. Otherwise, return the count.
    const count = rs.rows.length > 0 ? rs.rows[0].count : 0;
    return res.status(200).json({ count });

  } catch (e) {
    console.error('Failed to fetch likes:', e);
    return res.status(500).json({ error: 'Failed to fetch likes' });
  }
};
