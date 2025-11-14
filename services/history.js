// Simple history repo using expo-sqlite async API

export async function createHistorySchema(db) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS history (
      id INTEGER PRIMARY KEY NOT NULL,
      pageid INTEGER,
      title TEXT NOT NULL,
      visited_at TEXT DEFAULT (datetime('now'))
    );
  `);
}

export async function addHistoryEntry(db, { id: pageid, title }) {
  if (!title) return;
  await db.runAsync(
    `INSERT INTO history (pageid, title) VALUES (?, ?)`,
    pageid ?? null,
    title
  );
}

export async function listHistory(db) {
  return db.getAllAsync(`
    SELECT * FROM history ORDER BY visited_at DESC
  `);
}

export async function clearHistory(db) {
  await db.runAsync(`DELETE FROM history`);
}

export default { createHistorySchema, addHistoryEntry, listHistory, clearHistory };