import { createClient } from "@libsql/client/web";

const client = createClient({
  url: process.env.TURSO_DB_URL,
  authToken: process.env.TURSO_DB_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Ensure body is parsed correctly
    let body = req.body;
    if (typeof body === "string") {
      body = JSON.parse(body);
    }
    const { photoId } = body;

    // Insert or update likes
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

    res.status(200).json({ likes: result.rows[0].count });
  } catch (err) {
    console.error("Function error:", err);
    res.status(500).json({ error: err.message });
  }
}
