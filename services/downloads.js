

export async function createDownloadsSchema(db) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS downloads (
      id INTEGER PRIMARY KEY NOT NULL,
      pageid INTEGER,
      title TEXT NOT NULL,
      image TEXT,
      url TEXT,
      extract TEXT,
      saved_at TEXT DEFAULT (datetime('now'))
    );
  `);
}

export async function addDownload(db, { id: pageid, title, image, url, extract }) {
  await db.runAsync(
    `INSERT OR REPLACE INTO downloads (pageid, title, image, url, extract) VALUES (?, ?, ?, ?, ?)`,
    pageid ?? null,
    title,
    image ?? null,
    url ?? null,
    extract ?? null
  );
}

export async function removeDownload(db, pageid, title) {
  if (pageid != null) {
    await db.runAsync('DELETE FROM downloads WHERE pageid = ?', pageid);
  } else {
    await db.runAsync('DELETE FROM downloads WHERE title = ?', title);
  }
}

export async function isDownloaded(db, pageid, title) {
  const row = await db.getFirstAsync(
    'SELECT 1 AS ok FROM downloads WHERE (pageid = ? AND pageid IS NOT NULL) OR title = ? LIMIT 1',
    pageid ?? null,
    title
  );
  return !!row;
}

export async function listDownloads(db) {
  return db.getAllAsync('SELECT * FROM downloads ORDER BY saved_at DESC');
}

export default { createDownloadsSchema, addDownload, removeDownload, isDownloaded, listDownloads };