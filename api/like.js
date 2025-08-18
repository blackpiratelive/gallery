import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.TURSO_DB_URL,
  authToken: process.env.TURSO_DB_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Parse body safely
    let body = req.body;
    if (typeof body === "string") {
      body = JSON.parse(body);
    }

    const { photoId } = body;

    if (!photoId) {
      return res.status(400).json({ error: "Missing photoId" });
    }

    // Insert if new, otherwise increment
    await client.execute(
      "INSERT INTO likes (photo_id, count) VALUES (?, 1) " +
      "ON CONFLICT(photo_id) DO UPDATE SET count = count + 1",
      [photoId]
    );

    // Fetch updated count
    const result = await client.execute(
      "SELECT count FROM likes WHERE photo_id = ?",
      [photoId]
    );

    const likes = result.rows[0]?.count ?? 0;

    return res.status(200).json({ likes });
  } catch (err) {
    console.error("Like API error:", err);
    return res.status(500).json({ error: err.message });
  }
}