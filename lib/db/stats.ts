import type { SQLiteDatabase } from "expo-sqlite";

export interface StatsResult {
  tripsTotal: number;
  placesTotal: number;
  photosTotal: number;
  tripsLastYear: number;
}

/**
 * Сводная статистика: количество поездок, мест и фото (всего и поездок за год).
 */
export async function getStats(db: SQLiteDatabase): Promise<StatsResult> {
  const [tripsTotal, placesTotal, photosPlace, photosTrip, tripsLastYear] = await Promise.all([
    db.getFirstAsync<{ count: number }>("SELECT COUNT(*) AS count FROM trips").then((r) => r?.count ?? 0),
    db.getFirstAsync<{ count: number }>("SELECT COUNT(*) AS count FROM places").then((r) => r?.count ?? 0),
    db.getFirstAsync<{ count: number }>("SELECT COUNT(*) AS count FROM place_photos").then((r) => r?.count ?? 0),
    db.getFirstAsync<{ count: number }>("SELECT COUNT(*) AS count FROM trip_place_photos").then((r) => r?.count ?? 0),
    db
      .getFirstAsync<{ count: number }>(
        "SELECT COUNT(*) AS count FROM trips WHERE startDate >= date('now', '-12 months')"
      )
      .then((r) => r?.count ?? 0),
  ]);
  return {
    tripsTotal,
    placesTotal,
    photosTotal: photosPlace + photosTrip,
    tripsLastYear,
  };
}

export interface TopVisitedPlace {
  placeId: number;
  name: string;
  visitCount: number;
}

/**
 * Места, отмеченные «посещёнными» в поездках, отсортированные по количеству посещений (убывание).
 */
export async function getTopVisitedPlaces(db: SQLiteDatabase): Promise<TopVisitedPlace[]> {
  const rows = await db.getAllAsync<{ placeId: number; name: string; visitCount: number }>(
    `SELECT p.id AS placeId, p.name AS name, COUNT(tp.id) AS visitCount
     FROM places p
     INNER JOIN trip_places tp ON tp.placeId = p.id
     WHERE tp.visited = 1
     GROUP BY p.id
     ORDER BY visitCount DESC`
  );
  return rows;
}
