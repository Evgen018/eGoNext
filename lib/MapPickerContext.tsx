import { createContext, useCallback, useContext, useState } from "react";

export interface MapPickerResult {
  latitude: number;
  longitude: number;
}

interface MapPickerContextValue {
  result: MapPickerResult | null;
  setResult: (coords: MapPickerResult | null) => void;
  consumeResult: () => MapPickerResult | null;
}

const MapPickerContext = createContext<MapPickerContextValue | null>(null);

export function MapPickerProvider({ children }: { children: React.ReactNode }) {
  const [result, setResult] = useState<MapPickerResult | null>(null);

  const consumeResult = useCallback(() => {
    const r = result;
    setResult(null);
    return r;
  }, [result]);

  return (
    <MapPickerContext.Provider
      value={{
        result,
        setResult,
        consumeResult,
      }}
    >
      {children}
    </MapPickerContext.Provider>
  );
}

export function useMapPicker() {
  const ctx = useContext(MapPickerContext);
  if (!ctx) throw new Error("useMapPicker must be used within MapPickerProvider");
  return ctx;
}
