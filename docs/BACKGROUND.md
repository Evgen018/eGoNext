# Фоновое изображение (ImageBackground)

Как добавить фоновое изображение `.png` на все экраны или на выбранные, используя компонент `ImageBackground` из React Native.

---

## Схема (как на структуре проекта)

```
app/
  _layout.tsx          ← общий layout для ВСЕГО приложения
  index.tsx            ← главный экран
  profile.tsx          ← другой экран
  settings/            ← секция настроек
    _layout.tsx        ← layout только для экранов внутри settings/
    index.tsx          ← экран /settings
```

- **app/_layout.tsx** — фон для всех экранов
- **app/settings/_layout.tsx** — фон только для экранов в секции settings
- **Отдельный экран** — `ImageBackground` в самом файле экрана

---

## 1. Фон на ВСЕ экраны

Файл: **`app/_layout.tsx`**

```tsx
import { BackgroundLayout } from "@/lib/BackgroundLayout";

// Вариант А: включить фон (положите .png в корень или assets/images/)
const GLOBAL_BACKGROUND = require("@/egonext-bg.png");

// Вариант Б: отключить фон
// const GLOBAL_BACKGROUND = null;

function AppContent() {
  return (
    <BackgroundLayout source={GLOBAL_BACKGROUND}>
      <PaperProvider theme={theme}>
        <Stack screenOptions={{ headerShown: false }} />
      </PaperProvider>
    </BackgroundLayout>
  );
}
```

Положите файл `egonext-bg.png` в корень проекта или `assets/images/background.png` и используйте:

```tsx
const GLOBAL_BACKGROUND = require("@/assets/images/background.png");
```

---

## 2. Фон только для группы экранов (например, настройки)

Добавьте папку с `_layout.tsx` для нужной секции.

Пример: **`app/settings/_layout.tsx`**

```tsx
import { Stack } from "expo-router";
import { BackgroundLayout } from "@/lib/BackgroundLayout";

const SETTINGS_BACKGROUND = require("@/assets/images/settings-bg.png");

export default function SettingsLayout() {
  return (
    <BackgroundLayout source={SETTINGS_BACKGROUND}>
      <Stack screenOptions={{ headerShown: false }} />
    </BackgroundLayout>
  );
}
```

Тогда фон будет только у экранов внутри `settings/` (например `/settings`, `/settings/privacy` и т.п.).

Для других групп — `places/`, `trips/` — аналогично создайте `_layout.tsx` с `BackgroundLayout`.

---

## 3. Фон на ОДИН конкретный экран

Файл самого экрана, например **`app/profile.tsx`**:

```tsx
import { ImageBackground, View, StyleSheet } from "react-native";

const bgImage = require("@/assets/images/profile-bg.png");

export default function ProfileScreen() {
  return (
    <ImageBackground source={bgImage} style={styles.background} resizeMode="cover">
      <View style={styles.content}>
        {/* Ваш контент */}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  content: { flex: 1 },
});
```

---

## 4. Куда класть изображения

| Путь                          | Пример require                          |
|-------------------------------|-----------------------------------------|
| Корень: `egonext-bg.png`      | `require("@/egonext-bg.png")`           |
| Папка assets: `assets/images/` | `require("@/assets/images/background.png")` |

Формат: `.png`, `.jpg`, `.jpeg`.

---

## 5. Отключить фон

Просто замените значение на `null`:

```tsx
const GLOBAL_BACKGROUND = null;
```

---

## 6. Компонент BackgroundLayout

Файл **`lib/BackgroundLayout.tsx`**:

- Если `source` задан — оборачивает детей в `ImageBackground`
- Если `source === null` или не передан — рендерит только `children`

Можно использовать в любом месте, не только в layouts.
