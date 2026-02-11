/**
 * На native Metro подставит DbProvider.native.tsx, на web — DbProvider.web.tsx.
 * Этот файл нужен для разрешения путей в TypeScript.
 */
export { DbProvider, useDb } from "./DbProvider.native";
