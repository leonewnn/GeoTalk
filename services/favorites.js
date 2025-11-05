// Minimal Favorites repo using expo-sqlite async API

export async function createSchema(db) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY NOT NULL,
      pageid INTEGER,
      title TEXT NOT NULL,
      image TEXT,
      url TEXT,
      UNIQUE(pageid, title)
    );
  `);
}

export async function addFavorite(db, { id: pageid, title, image, url }) {
  await db.runAsync(
    'INSERT OR IGNORE INTO favorites (pageid, title, image, url) VALUES (?, ?, ?, ?)',
    pageid ?? null,
    title,
    image ?? null,
    url ?? null
  );
}

export async function removeFavorite(db, pageid, title) {
  if (pageid != null) {
    await db.runAsync('DELETE FROM favorites WHERE pageid = ?', pageid);
  } else {
    await db.runAsync('DELETE FROM favorites WHERE title = ?', title);
  }
}

export async function isFavorite(db, pageid, title) {
  const row = await db.getFirstAsync(
    'SELECT 1 AS ok FROM favorites WHERE (pageid = ? AND pageid IS NOT NULL) OR title = ? LIMIT 1',
    pageid ?? null,
    title
  );
  return !!row;
}

// For later list screen
export async function listFavorites(db) {
  return db.getAllAsync('SELECT * FROM favorites ORDER BY id DESC');
}