// api/get-likes.js
const { createClient } = require('@libsql/client');

const dbUrl = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

module.exports = async (req, res) => {
  if (!dbUrl || !authToken) {
    return res.status(500).json({ error: "Server configuration error." });
  }

  // Ensure we use libsql:// protocol (even if env has https://)
  const db = createClient({
    url: dbUrl.replace(/^https?:\/\//, "libsql://"),
    authToken,
  });

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-cache');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { slug } = req.query;
  if (!slug) return res.status(400).json({ error: 'Slug is required' });

  try {
    const rs = await db.execute({
      sql: 'SELECT likes_count FROM likes WHERE slug = ?',
      args: [slug],
    });
    const count = rs.rows.length > 0 ? rs.rows[0].likes_count : 0;
    return res.status(200).json({ count });
  } catch (e) {
    console.error('Failed to fetch likes:', e);
    return res.status(500).json({ error: 'Failed to fetch likes' });
  }
};
