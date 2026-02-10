import type { ReactNode } from "react";
import { ImageBackground, StyleSheet, type ImageSourcePropType } from "react-native";

type Props = {
  source?: ImageSourcePropType | null;
  children: ReactNode;
};

/**
 * Оборачивает контент в ImageBackground, если передан source.
 * Если source не передан — отображает только children.
 * Используйте для фона в _layout.tsx или на отдельном экране.
 */
export function BackgroundLayout({ source, children }: Props) {
  if (!source) {
    return <>{children}</>;
  }
  return (
    <ImageBackground
      source={source}
      style={styles.background}
      resizeMode="cover"
    >
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
});
