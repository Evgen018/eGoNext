import * as FileSystem from "expo-file-system";

const PHOTOS_DIR = "photos";

/**
 * Каталог для хранения фотографий приложения (в documentDirectory).
 */
export function getPhotosDirectory(): string {
  const dir = `${FileSystem.documentDirectory}${PHOTOS_DIR}/`;
  return dir;
}

/**
 * Убедиться, что каталог фотографий существует.
 */
export async function ensurePhotosDirectory(): Promise<string> {
  const dir = getPhotosDirectory();
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
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
  await FileSystem.copyAsync({ from: sourceUri, to: destUri });
  return destUri;
}

/**
 * Удалить файл по пути. Игнорирует ошибки, если файла нет.
 */
export async function deletePhotoFile(uri: string): Promise<void> {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists) {
      await FileSystem.deleteAsync(uri);
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
