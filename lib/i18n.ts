import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LANGUAGE_STORAGE_KEY = "@egonext/language";

import ru from "../locales/ru.json";
import en from "../locales/en.json";

export const SUPPORTED_LANGUAGES = ["ru", "en"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export async function getStoredLanguage(): Promise<SupportedLanguage | null> {
  const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (stored === "ru" || stored === "en") return stored;
  return null;
}

export async function setStoredLanguage(lang: SupportedLanguage): Promise<void> {
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
}

i18n.use(initReactI18next).init({
  resources: {
    ru: { translation: ru },
    en: { translation: en },
  },
  lng: "ru",
  fallbackLng: "ru",
  compatibilityJSON: "v4",
  interpolation: {
    escapeValue: false,
  },
});

/** Загрузить сохранённый язык при запуске (вызвать в корневом layout). */
export async function loadStoredLanguage(): Promise<void> {
  const stored = await getStoredLanguage();
  if (stored) await i18n.changeLanguage(stored);
}

export async function changeAppLanguage(lang: SupportedLanguage): Promise<void> {
  await i18n.changeLanguage(lang);
  await setStoredLanguage(lang);
}

export default i18n;
