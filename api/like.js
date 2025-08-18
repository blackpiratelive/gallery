// api/like.js

const { createClient } = require('@libsql/client');

// Initialize the Turso DB client using environment variables
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

module.exports = async (req, res) => {
  // --- RESPONSE HEADERS ---
  // Allow requests from your site's origin
  res.setHeader('Access-Control-Allow-Origin', '*'); // For production, replace '*' with your actual domain
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  // **FIX**: Prevent Vercel from caching the API response
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');


  // Handle preflight requests for CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Get the unique photo slug from the query parameter
  const { slug } = req.query;

  if (!slug) {
    return res.status(400).json({ error: 'Slug is required' });
  }

  // --- HANDLE GET REQUEST (Fetch Likes) ---
  if (req.method === 'GET') {
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
  }

  // --- HANDLE POST REQUEST (Increment Likes) ---
  if (req.method === 'POST') {
    try {
      // Use INSERT ... ON CONFLICT to create the row or increment the count atomically
      await db.execute({
        sql: 'INSERT INTO likes (slug, count) VALUES (?, 1) ON CONFLICT(slug) DO UPDATE SET count = count + 1',
        args: [slug],
      });
      
      // Fetch the new count to return it
      const rs = await db.execute({
        sql: 'SELECT count FROM likes WHERE slug = ?',
        args: [slug],
      });

      const newCount = rs.rows[0].count;
      return res.status(200).json({ count: newCount });

    } catch (e) {
      console.error('Failed to update likes:', e);
      return res.status(500).json({ error: 'Failed to update likes' });
    }
  }

  // If not GET or POST, return method not allowed
  return res.status(4isColorDarko5).json({ error: 'Method not allowed' });
};
