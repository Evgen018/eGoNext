import type { SQLiteDatabase } from "expo-sqlite";
import type { TripPlace } from "./types";

export async function getTripPlacesByTripId(db: SQLiteDatabase, tripId: number): Promise<TripPlace[]> {
  const rows = await db.getAllAsync<TripPlace>(
    'SELECT id, tripId, placeId, "order", visited, visitDate, notes FROM trip_places WHERE tripId = ? ORDER BY "order", id',
    tripId
  );
  return rows;
}

export async function getTripPlaceById(db: SQLiteDatabase, id: number): Promise<TripPlace | null> {
  const row = await db.getFirstAsync<TripPlace>(
    'SELECT id, tripId, placeId, "order", visited, visitDate, notes FROM trip_places WHERE id = ?',
    id
  );
  return row ?? null;
}

export async function getNextUnvisitedTripPlace(
  db: SQLiteDatabase,
  tripId: number
): Promise<TripPlace | null> {
  const row = await db.getFirstAsync<TripPlace>(
    'SELECT id, tripId, placeId, "order", visited, visitDate, notes FROM trip_places WHERE tripId = ? AND visited = 0 ORDER BY "order" LIMIT 1',
    tripId
  );
  return row ?? null;
}

export interface InsertTripPlaceInput {
  tripId: number;
  placeId: number;
  order?: number;
}

export async function insertTripPlace(
  db: SQLiteDatabase,
  input: InsertTripPlaceInput
): Promise<number> {
  const nextOrder =
    input.order ??
    ((await db.getFirstAsync<{ max: number | null }>(
      'SELECT MAX("order") AS max FROM trip_places WHERE tripId = ?',
      input.tripId
    ))?.max ?? -1) + 1;
  const { lastInsertRowId } = await db.runAsync(
    'INSERT INTO trip_places (tripId, placeId, "order", visited, visitDate, notes) VALUES (?, ?, ?, 0, NULL, NULL)',
    input.tripId,
    input.placeId,
    nextOrder
  );
  return lastInsertRowId as number;
}

export async function updateTripPlaceOrder(
  db: SQLiteDatabase,
  id: number,
  order: number
): Promise<void> {
  await db.runAsync('UPDATE trip_places SET "order" = ? WHERE id = ?', order, id);
}

export async function markTripPlaceVisited(
  db: SQLiteDatabase,
  id: number,
  visitDate?: string
): Promise<void> {
  const date = visitDate ?? new Date().toISOString().slice(0, 10);
  await db.runAsync("UPDATE trip_places SET visited = 1, visitDate = ? WHERE id = ?", date, id);
}

export async function updateTripPlaceNotes(db: SQLiteDatabase, id: number, notes: string | null): Promise<void> {
  await db.runAsync("UPDATE trip_places SET notes = ? WHERE id = ?", notes, id);
}

export async function deleteTripPlace(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync("DELETE FROM trip_places WHERE id = ?", id);
}

/** Поменять порядок двух мест в поездке (для move up/down). */
export async function swapTripPlaceOrder(
  db: SQLiteDatabase,
  tripPlaceId: number,
  direction: "up" | "down"
): Promise<void> {
  const item = await getTripPlaceById(db, tripPlaceId);
  if (!item) return;
  const all = await getTripPlacesByTripId(db, item.tripId);
  const idx = all.findIndex((t) => t.id === tripPlaceId);
  if (idx < 0) return;
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= all.length) return;
  const other = all[swapIdx];
  await db.runAsync('UPDATE trip_places SET "order" = ? WHERE id = ?', other.order, item.id);
  await db.runAsync('UPDATE trip_places SET "order" = ? WHERE id = ?', item.order, other.id);
}
