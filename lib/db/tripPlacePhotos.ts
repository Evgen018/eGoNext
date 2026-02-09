import type { SQLiteDatabase } from "expo-sqlite";
import type { TripPlacePhoto } from "./types";

export async function getPhotosByTripPlaceId(
  db: SQLiteDatabase,
  tripPlaceId: number
): Promise<TripPlacePhoto[]> {
  const rows = await db.getAllAsync<TripPlacePhoto>(
    "SELECT id, tripPlaceId, uri, sortOrder FROM trip_place_photos WHERE tripPlaceId = ? ORDER BY sortOrder, id",
    tripPlaceId
  );
  return rows;
}

export async function addTripPlacePhoto(
  db: SQLiteDatabase,
  tripPlaceId: number,
  uri: string,
  sortOrder?: number
): Promise<number> {
  const next =
    sortOrder ??
    ((await db.getFirstAsync<{ max: number | null }>(
      "SELECT MAX(sortOrder) AS max FROM trip_place_photos WHERE tripPlaceId = ?",
      tripPlaceId
    ))?.max ?? -1) + 1;
  const { lastInsertRowId } = await db.runAsync(
    "INSERT INTO trip_place_photos (tripPlaceId, uri, sortOrder) VALUES (?, ?, ?)",
    tripPlaceId,
    uri,
    next
  );
  return lastInsertRowId as number;
}

export async function deleteTripPlacePhoto(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync("DELETE FROM trip_place_photos WHERE id = ?", id);
}

export async function deleteAllPhotosForTripPlace(
  db: SQLiteDatabase,
  tripPlaceId: number
): Promise<void> {
  await db.runAsync("DELETE FROM trip_place_photos WHERE tripPlaceId = ?", tripPlaceId);
}
