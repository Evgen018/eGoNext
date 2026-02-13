import type { Trip } from "@/lib/db/types";

export interface TripPlaceForShare {
  id?: number; // trip_places.id — для привязки фото
  placeName: string;
  latitude: number | null;
  longitude: number | null;
  visitDate?: string | null;
  notes?: string | null;
  order: number;
}

/**
 * Собрать текст маршрута для шаринга (мессенджер, почта).
 */
export function buildShareMessage(
  trip: Trip,
  places: TripPlaceForShare[],
  labels: { route: string; dates: string; noCoords: string }
): string {
  const lines: string[] = [
    `${labels.route}: ${trip.title}`,
    `${labels.dates}: ${trip.startDate} — ${trip.endDate}`,
    "",
  ];
  places.forEach((p, idx) => {
    const coords =
      p.latitude != null && p.longitude != null
        ? `${p.latitude.toFixed(6)}, ${p.longitude.toFixed(6)}`
        : labels.noCoords;
    lines.push(`${idx + 1}. ${p.placeName} (${coords})`);
  });
  return lines.join("\n");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Собрать HTML для экспорта поездки в PDF.
 * photoBase64ByTripPlaceId: опционально превью (base64) для каждого места по tripPlaceId.
 */
export function buildTripPdfHtml(
  trip: Trip,
  places: TripPlaceForShare[],
  options?: {
    photoBase64ByTripPlaceId?: Map<number, string>;
    routeHeading?: string;
  }
): string {
  const photoBase64ByTripPlaceId = options?.photoBase64ByTripPlaceId;
  const routeHeading = escapeHtml(options?.routeHeading ?? "Маршрут");
  const title = escapeHtml(trip.title);
  const desc = trip.description ? `<p>${escapeHtml(trip.description)}</p>` : "";
  const rows = places
    .map((p, idx) => {
      const name = escapeHtml(p.placeName);
      const coords =
        p.latitude != null && p.longitude != null
          ? `${p.latitude.toFixed(6)}, ${p.longitude.toFixed(6)}`
          : "";
      const visited = p.visitDate ? ` <small>(${escapeHtml(p.visitDate)})</small>` : "";
      const notes = p.notes ? `<br/><em>${escapeHtml(p.notes)}</em>` : "";
      const photoImg =
        p.id != null && photoBase64ByTripPlaceId?.get(p.id)
          ? `<img src="data:image/jpeg;base64,${photoBase64ByTripPlaceId.get(p.id)!}" style="max-width:120px;max-height:90px;margin-top:4px;border-radius:4px;" alt="" />`
          : "";
      return `<tr><td style="vertical-align:top;padding:8px 12px 12px 0;">${idx + 1}.</td><td style="padding:8px 0 12px 0;"><strong>${name}</strong>${visited}<br/><code>${escapeHtml(coords) || "—"}</code>${notes}${photoImg}</td></tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: system-ui, sans-serif; padding: 16px; color: #333; font-size: 14px; }
    h1 { font-size: 20px; margin-bottom: 4px; }
    .dates { color: #666; margin-bottom: 16px; }
    table { border-collapse: collapse; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p class="dates">${trip.startDate} — ${trip.endDate}</p>
  ${desc}
  <h2 style="font-size:16px;margin-top:20px;">${routeHeading}</h2>
  <table>${rows}</table>
</body>
</html>`;
}
