import type { ReactNode } from "react";
import { View, StyleSheet, type ImageSourcePropType } from "react-native";

/** На web при сборке Metro может отдать require() как строку URL. Путь относительно lib/. */
const WEB_FALLBACK_BG = require("../assets/images/egonext-bg.png");

type Props = {
  source?: ImageSourcePropType | null;
  children: ReactNode;
};

function getBackgroundUri(source: NonNullable<typeof source>): string | null {
  if (typeof source === "string" && source.length > 0) return source;
  if (typeof source === "object" && source !== null && "uri" in source) {
    const u = (source as { uri?: string }).uri;
    return typeof u === "string" && u.length > 0 ? u : null;
  }
  if (typeof source === "number") {
    try {
      const { Image } = require("react-native");
      const resolved = Image.resolveAssetSource(source);
      const u = resolved?.uri;
      return typeof u === "string" && u.length > 0 ? u : null;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Web: фон через CSS backgroundImage. На web require() картинки часто возвращает URL-строку.
 */
export function BackgroundLayout({ source, children }: Props) {
  if (!source) {
    return <>{children}</>;
  }

  let uri = getBackgroundUri(source);
  if (!uri && typeof WEB_FALLBACK_BG === "string" && WEB_FALLBACK_BG.length > 0) {
    uri = WEB_FALLBACK_BG;
  }

  if (!uri) {
    return <>{children}</>;
  }

  return (
    <View
      style={[
        styles.background,
        {
          backgroundImage: `url(${uri})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    minHeight: "100%",
  },
});
