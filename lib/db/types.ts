/**
 * Типы сущностей для БД (PROJECT.md).
 */

export interface Place {
  id: number;
  name: string;
  description: string;
  visitlater: number; // SQLite: 0/1
  liked: number;
  latitude: number | null;
  longitude: number | null;
  createdAt: string; // ISO
}

export interface PlacePhoto {
  id: number;
  placeId: number;
  uri: string;
  sortOrder: number;
}

export interface Trip {
  id: number;
  title: string;
  description: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;
  createdAt: string;
  current: number; // 0/1
}

export interface TripPlace {
  id: number;
  tripId: number;
  placeId: number;
  order: number;
  visited: number;
  visitDate: string | null;
  notes: string | null;
}

export interface TripPlacePhoto {
  id: number;
  tripPlaceId: number;
  uri: string;
  sortOrder: number;
}
