import { createClient } from "@libsql/client/web";

const client = createClient({
  url: process.env.TURSO_DB_URL,
  authToken: process.env.TURSO_DB_TOKEN,
});

export default async function handler(req, res) {
  const { photoId } = JSON.parse(req.body);

  await client.execute(
    "INSERT INTO likes (photo_id, count) VALUES (?, 1) ON CONFLICT(photo_id) DO UPDATE SET count = count + 1",
    [photoId]
  );

  const result = await client.execute("SELECT count FROM likes WHERE photo_id = ?", [photoId]);

  res.status(200).json({ likes: result.rows[0].count });
}
