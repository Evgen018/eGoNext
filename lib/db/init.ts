import type { SQLiteDatabase } from "expo-sqlite";

const DATABASE_VERSION = 1;

export async function initSchema(db: SQLiteDatabase): Promise<void> {
  const { user_version: currentVersion } = (await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version"
  ))!;
  if (currentVersion >= DATABASE_VERSION) return;

  await db.execAsync(`
    PRAGMA journal_mode = 'wal';
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS places (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      visitlater INTEGER NOT NULL DEFAULT 1,
      liked INTEGER NOT NULL DEFAULT 0,
      latitude REAL,
      longitude REAL,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS place_photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      placeId INTEGER NOT NULL REFERENCES places(id) ON DELETE CASCADE,
      uri TEXT NOT NULL,
      sortOrder INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS trips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      startDate TEXT NOT NULL,
      endDate TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      current INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS trip_places (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tripId INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
      placeId INTEGER NOT NULL REFERENCES places(id),
      "order" INTEGER NOT NULL DEFAULT 0,
      visited INTEGER NOT NULL DEFAULT 0,
      visitDate TEXT,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS trip_place_photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tripPlaceId INTEGER NOT NULL REFERENCES trip_places(id) ON DELETE CASCADE,
      uri TEXT NOT NULL,
      sortOrder INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_place_photos_placeId ON place_photos(placeId);
    CREATE INDEX IF NOT EXISTS idx_trip_places_tripId ON trip_places(tripId);
    CREATE INDEX IF NOT EXISTS idx_trip_places_placeId ON trip_places(placeId);
    CREATE INDEX IF NOT EXISTS idx_trip_place_photos_tripPlaceId ON trip_place_photos(tripPlaceId);
    CREATE INDEX IF NOT EXISTS idx_trips_current ON trips(current);
  `);

  await db.runAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
