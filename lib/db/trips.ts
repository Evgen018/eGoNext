import type { SQLiteDatabase } from "expo-sqlite";
import type { Trip } from "./types";

export async function getAllTrips(db: SQLiteDatabase): Promise<Trip[]> {
  const rows = await db.getAllAsync<Trip>(
    "SELECT id, title, description, startDate, endDate, createdAt, current FROM trips ORDER BY startDate DESC"
  );
  return rows;
}

export async function getTripById(db: SQLiteDatabase, id: number): Promise<Trip | null> {
  const row = await db.getFirstAsync<Trip>(
    "SELECT id, title, description, startDate, endDate, createdAt, current FROM trips WHERE id = ?",
    id
  );
  return row ?? null;
}

export async function getCurrentTrip(db: SQLiteDatabase): Promise<Trip | null> {
  const row = await db.getFirstAsync<Trip>(
    "SELECT id, title, description, startDate, endDate, createdAt, current FROM trips WHERE current = 1 LIMIT 1"
  );
  return row ?? null;
}

export interface InsertTripInput {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  current?: boolean;
}

export async function insertTrip(db: SQLiteDatabase, input: InsertTripInput): Promise<number> {
  const createdAt = new Date().toISOString();
  if (input.current) {
    await db.runAsync("UPDATE trips SET current = 0");
  }
  const { lastInsertRowId } = await db.runAsync(
    `INSERT INTO trips (title, description, startDate, endDate, createdAt, current)
     VALUES (?, ?, ?, ?, ?, ?)`,
    input.title,
    input.description ?? "",
    input.startDate,
    input.endDate,
    createdAt,
    input.current ? 1 : 0
  );
  return lastInsertRowId as number;
}

export async function updateTrip(
  db: SQLiteDatabase,
  id: number,
  input: Partial<InsertTripInput>
): Promise<void> {
  const trip = await getTripById(db, id);
  if (!trip) return;
  if (input.current === true) {
    await db.runAsync("UPDATE trips SET current = 0");
  }
  await db.runAsync(
    `UPDATE trips SET title = ?, description = ?, startDate = ?, endDate = ?, current = ?
     WHERE id = ?`,
    input.title ?? trip.title,
    input.description ?? trip.description,
    input.startDate ?? trip.startDate,
    input.endDate ?? trip.endDate,
    input.current !== undefined ? (input.current ? 1 : 0) : trip.current,
    id
  );
}

export async function setCurrentTrip(db: SQLiteDatabase, tripId: number): Promise<void> {
  await db.runAsync("UPDATE trips SET current = 0");
  await db.runAsync("UPDATE trips SET current = 1 WHERE id = ?", tripId);
}

export async function deleteTrip(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync("DELETE FROM trips WHERE id = ?", id);
}
