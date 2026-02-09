import type { SQLiteDatabase } from "expo-sqlite";
import type { Place } from "./types";

export async function getAllPlaces(db: SQLiteDatabase): Promise<Place[]> {
  const rows = await db.getAllAsync<Place>(
    "SELECT id, name, description, visitlater, liked, latitude, longitude, createdAt FROM places ORDER BY createdAt DESC"
  );
  return rows;
}

export async function getPlaceById(db: SQLiteDatabase, id: number): Promise<Place | null> {
  const row = await db.getFirstAsync<Place>(
    "SELECT id, name, description, visitlater, liked, latitude, longitude, createdAt FROM places WHERE id = ?",
    id
  );
  return row ?? null;
}

export interface InsertPlaceInput {
  name: string;
  description?: string;
  visitlater?: boolean;
  liked?: boolean;
  latitude?: number | null;
  longitude?: number | null;
}

export async function insertPlace(db: SQLiteDatabase, input: InsertPlaceInput): Promise<number> {
  const createdAt = new Date().toISOString();
  const { lastInsertRowId } = await db.runAsync(
    `INSERT INTO places (name, description, visitlater, liked, latitude, longitude, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    input.name,
    input.description ?? "",
    input.visitlater !== false ? 1 : 0,
    input.liked ? 1 : 0,
    input.latitude ?? null,
    input.longitude ?? null,
    createdAt
  );
  return lastInsertRowId as number;
}

export async function updatePlace(
  db: SQLiteDatabase,
  id: number,
  input: Partial<InsertPlaceInput>
): Promise<void> {
  const place = await getPlaceById(db, id);
  if (!place) return;
  await db.runAsync(
    `UPDATE places SET name = ?, description = ?, visitlater = ?, liked = ?, latitude = ?, longitude = ?
     WHERE id = ?`,
    input.name ?? place.name,
    input.description ?? place.description,
    input.visitlater !== undefined ? (input.visitlater ? 1 : 0) : place.visitlater,
    input.liked !== undefined ? (input.liked ? 1 : 0) : place.liked,
    input.latitude !== undefined ? input.latitude : place.latitude,
    input.longitude !== undefined ? input.longitude : place.longitude,
    id
  );
}

export async function deletePlace(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync("DELETE FROM places WHERE id = ?", id);
}
