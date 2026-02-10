import {
  documentDirectory,
  makeDirectoryAsync,
  getInfoAsync,
  copyAsync,
  deleteAsync,
} from "expo-file-system/legacy";

const PHOTOS_DIR = "photos";

/**
 * Каталог для хранения фотографий приложения (в documentDirectory).
 */
export function getPhotosDirectory(): string {
  const base = documentDirectory ?? "";
  const dir = `${base}${PHOTOS_DIR}/`;
  return dir;
}

/**
 * Убедиться, что каталог фотографий существует.
 */
export async function ensurePhotosDirectory(): Promise<string> {
  const dir = getPhotosDirectory();
  const info = await getInfoAsync(dir);
  if (!info.exists) {
    await makeDirectoryAsync(dir, { intermediates: true });
  }
  return dir;
}

/**
 * Сохранить файл по URI в каталог приложения и вернуть новый путь.
 * Если uri уже внутри documentDirectory, возвращаем как есть.
 */
export async function copyToAppStorage(sourceUri: string, filename: string): Promise<string> {
  const dir = await ensurePhotosDirectory();
  const destUri = `${dir}${filename}`;
  await copyAsync({ from: sourceUri, to: destUri });
  return destUri;
}

/**
 * Удалить файл по пути. Игнорирует ошибки, если файла нет.
 */
export async function deletePhotoFile(uri: string): Promise<void> {
  try {
    const info = await getInfoAsync(uri);
    if (info.exists) {
      await deleteAsync(uri);
    }
  } catch {
    // игнорируем
  }
}

/**
 * Сгенерировать уникальное имя файла для фото.
 */
export function generatePhotoFilename(prefix: string = "img"): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}.jpg`;
}
