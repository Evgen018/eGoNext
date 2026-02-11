"use client";

import React, { createContext, useContext, useMemo, type ReactNode } from "react";

/**
 * Заглушка БД для web: expo-sqlite на web даёт NoModificationAllowedError
 * при повторном открытии файла (вкладки, HMR). На web показываем пустые данные.
 */
type MockDb = {
  getFirstAsync: <T>(_sql: string, ..._params: unknown[]) => Promise<T | undefined>;
  getAllAsync: <T>(_sql: string, ..._params: unknown[]) => Promise<T[]>;
  runAsync: (_sql: string, ..._params: unknown[]) => Promise<{ lastInsertRowId: number }>;
  execAsync: (_sql: string) => Promise<void>;
};

const mockDb: MockDb = {
  getFirstAsync: async () => undefined,
  getAllAsync: async () => [],
  runAsync: async () => ({ lastInsertRowId: 0 }),
  execAsync: async () => {},
};

const WebDbContext = createContext<MockDb | null>(null);

export function useDb(): MockDb {
  const db = useContext(WebDbContext);
  if (!db) throw new Error("useDb must be used within DbProvider");
  return db;
}

type DbProviderProps = {
  children: ReactNode;
  databaseName?: string;
  onInit?: (db: MockDb) => Promise<void>;
};

export function DbProvider({ children, onInit }: DbProviderProps) {
  const value = useMemo(() => mockDb, []);
  return <WebDbContext.Provider value={value}>{children}</WebDbContext.Provider>;
}
