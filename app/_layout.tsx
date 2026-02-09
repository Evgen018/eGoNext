import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { PaperProvider } from "react-native-paper";
import { initSchema } from "@/lib/db/init";

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName="egonext.db" onInit={initSchema}>
      <PaperProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </PaperProvider>
    </SQLiteProvider>
  );
}
