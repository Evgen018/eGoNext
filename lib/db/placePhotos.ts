import type { SQLiteDatabase } from "expo-sqlite";
import type { PlacePhoto } from "./types";

export async function getPhotosByPlaceId(db: SQLiteDatabase, placeId: number): Promise<PlacePhoto[]> {
  const rows = await db.getAllAsync<PlacePhoto>(
    "SELECT id, placeId, uri, sortOrder FROM place_photos WHERE placeId = ? ORDER BY sortOrder, id",
    placeId
  );
  return rows;
}

export async function addPlacePhoto(
  db: SQLiteDatabase,
  placeId: number,
  uri: string,
  sortOrder?: number
): Promise<number> {
  const next =
    sortOrder ??
    ((await db.getFirstAsync<{ max: number | null }>("SELECT MAX(sortOrder) AS max FROM place_photos WHERE placeId = ?", placeId))?.max ?? -1) + 1;
  const { lastInsertRowId } = await db.runAsync(
    "INSERT INTO place_photos (placeId, uri, sortOrder) VALUES (?, ?, ?)",
    placeId,
    uri,
    next
  );
  return lastInsertRowId as number;
}

export async function deletePlacePhoto(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync("DELETE FROM place_photos WHERE id = ?", id);
}

export async function deleteAllPhotosForPlace(db: SQLiteDatabase, placeId: number): Promise<void> {
  await db.runAsync("DELETE FROM place_photos WHERE placeId = ?", placeId);
}
