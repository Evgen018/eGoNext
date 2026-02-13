import type { SQLiteDatabase } from "expo-sqlite";
import {
  cacheDirectory,
  documentDirectory,
  getInfoAsync,
  readAsStringAsync,
  writeAsStringAsync,
  EncodingType,
} from "expo-file-system/legacy";
import { getAllPlaces } from "@/lib/db/places";
import { getPhotosByPlaceId } from "@/lib/db/placePhotos";
import { getAllTrips } from "@/lib/db/trips";
import { getTripPlacesByTripId } from "@/lib/db/tripPlaces";
import { getPhotosByTripPlaceId } from "@/lib/db/tripPlacePhotos";
import { ensurePhotosDirectory } from "@/lib/storage/photos";
import { generatePhotoFilename } from "@/lib/storage/photos";
import type { Place, Trip, TripPlace } from "@/lib/db/types";

const BACKUP_VERSION = 1;

export interface BackupPlacePhoto {
  placeId: number;
  uri: string;
  sortOrder: number;
  base64?: string;
}

export interface BackupTripPlacePhoto {
  tripPlaceId: number;
  uri: string;
  sortOrder: number;
  base64?: string;
}

export interface BackupData {
  version: number;
  exportedAt: string;
  app: string;
  places: Place[];
  place_photos: BackupPlacePhoto[];
  trips: Trip[];
  trip_places: TripPlace[];
  trip_place_photos: BackupTripPlacePhoto[];
}

async function readUriAsBase64(uri: string): Promise<string | undefined> {
  try {
    const info = await getInfoAsync(uri);
    if (!info.exists || info.isDirectory) return undefined;
    const base64 = await readAsStringAsync(uri, { encoding: EncodingType.Base64 });
    return base64;
  } catch {
    return undefined;
  }
}

/**
 * Собрать все данные БД и фото (base64) в один JSON-объект.
 */
export async function exportToBackupData(db: SQLiteDatabase): Promise<BackupData> {
  const places = await getAllPlaces(db);
  const trips = await getAllTrips(db);

  const place_photos: BackupPlacePhoto[] = [];
  for (const place of places) {
    const photos = await getPhotosByPlaceId(db, place.id);
    for (const p of photos) {
      const base64 = await readUriAsBase64(p.uri);
      place_photos.push({
        placeId: p.placeId,
        uri: p.uri,
        sortOrder: p.sortOrder,
        ...(base64 && { base64 }),
      });
    }
  }

  const trip_places: TripPlace[] = [];
  const trip_place_photos: BackupTripPlacePhoto[] = [];
  for (const trip of trips) {
    const tps = await getTripPlacesByTripId(db, trip.id);
    trip_places.push(...tps);
    for (const tp of tps) {
      const photos = await getPhotosByTripPlaceId(db, tp.id);
      for (const p of photos) {
        const base64 = await readUriAsBase64(p.uri);
        trip_place_photos.push({
          tripPlaceId: p.tripPlaceId,
          uri: p.uri,
          sortOrder: p.sortOrder,
          ...(base64 && { base64 }),
        });
      }
    }
  }

  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    app: "eGoNext",
    places,
    place_photos,
    trips,
    trip_places,
    trip_place_photos,
  };
}

/**
 * Сохранить бэкап в JSON-файл в кэше и вернуть URI файла.
 */
export async function writeBackupFile(data: BackupData): Promise<string> {
  const cache = cacheDirectory ?? documentDirectory;
  if (!cache) throw new Error("No cache or document directory");
  const filename = `egonext_backup_${new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)}.json`;
  const fileUri = `${cache}${filename}`;
  await writeAsStringAsync(fileUri, JSON.stringify(data), { encoding: EncodingType.UTF8 });
  return fileUri;
}

/**
 * Экспорт: собрать данные и сохранить в файл. Возвращает URI файла для шаринга/сохранения.
 */
export async function createBackupFile(db: SQLiteDatabase): Promise<string> {
  const data = await exportToBackupData(db);
  return writeBackupFile(data);
}

/**
 * Прочитать и распарсить файл бэкапа.
 */
export async function readBackupFile(fileUri: string): Promise<BackupData> {
  const raw = await readAsStringAsync(fileUri, { encoding: EncodingType.UTF8 });
  const data = JSON.parse(raw) as BackupData;
  if (data.version !== BACKUP_VERSION || !data.places || !Array.isArray(data.trips)) {
    throw new Error("Invalid backup file format");
  }
  return data;
}

/**
 * Импорт: заменить текущие данные данными из бэкапа.
 * Таблицы очищаются в порядке зависимостей, затем вставляются данные с новыми ID.
 */
export async function importFromBackupData(
  db: SQLiteDatabase,
  data: BackupData
): Promise<void> {
  await db.execAsync(`
    DELETE FROM trip_place_photos;
    DELETE FROM trip_places;
    DELETE FROM place_photos;
    DELETE FROM trips;
    DELETE FROM places;
  `);

  const placeIdMap = new Map<number, number>();
  for (const p of data.places) {
    const { lastInsertRowId } = await db.runAsync(
      `INSERT INTO places (name, description, visitlater, liked, latitude, longitude, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      p.name,
      p.description ?? "",
      p.visitlater ?? 1,
      p.liked ?? 0,
      p.latitude ?? null,
      p.longitude ?? null,
      p.createdAt
    );
    placeIdMap.set(p.id, lastInsertRowId as number);
  }

  const photosDir = await ensurePhotosDirectory();
  for (const pp of data.place_photos) {
    const newPlaceId = placeIdMap.get(pp.placeId);
    if (newPlaceId == null) continue;
    let uri = pp.uri;
    if (pp.base64) {
      const filename = generatePhotoFilename("place");
      uri = `${photosDir}${filename}`;
      await writeAsStringAsync(uri, pp.base64, { encoding: EncodingType.Base64 });
    }
    await db.runAsync(
      "INSERT INTO place_photos (placeId, uri, sortOrder) VALUES (?, ?, ?)",
      newPlaceId,
      uri,
      pp.sortOrder ?? 0
    );
  }

  const tripIdMap = new Map<number, number>();
  for (const t of data.trips) {
    const { lastInsertRowId } = await db.runAsync(
      `INSERT INTO trips (title, description, startDate, endDate, createdAt, current)
       VALUES (?, ?, ?, ?, ?, ?)`,
      t.title,
      t.description ?? "",
      t.startDate,
      t.endDate,
      t.createdAt,
      t.current ?? 0
    );
    tripIdMap.set(t.id, lastInsertRowId as number);
  }

  const tripPlaceIdMap = new Map<number, number>();
  for (const tp of data.trip_places) {
    const newTripId = tripIdMap.get(tp.tripId);
    const newPlaceId = placeIdMap.get(tp.placeId);
    if (newTripId == null || newPlaceId == null) continue;
    const { lastInsertRowId } = await db.runAsync(
      'INSERT INTO trip_places (tripId, placeId, "order", visited, visitDate, notes) VALUES (?, ?, ?, ?, ?, ?)',
      newTripId,
      newPlaceId,
      tp.order ?? 0,
      tp.visited ?? 0,
      tp.visitDate ?? null,
      tp.notes ?? null
    );
    tripPlaceIdMap.set(tp.id, lastInsertRowId as number);
  }

  for (const tpp of data.trip_place_photos) {
    const newTripPlaceId = tripPlaceIdMap.get(tpp.tripPlaceId);
    if (newTripPlaceId == null) continue;
    let uri = tpp.uri;
    if (tpp.base64) {
      const filename = generatePhotoFilename("trip");
      uri = `${photosDir}${filename}`;
      await writeAsStringAsync(uri, tpp.base64, { encoding: EncodingType.Base64 });
    }
    await db.runAsync(
      "INSERT INTO trip_place_photos (tripPlaceId, uri, sortOrder) VALUES (?, ?, ?)",
      newTripPlaceId,
      uri,
      tpp.sortOrder ?? 0
    );
  }
}
