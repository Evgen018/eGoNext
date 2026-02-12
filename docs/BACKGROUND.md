# Как изменить фоновое изображение

Пошаговая инструкция: где и что именно писать, чтобы включить или отключить фон. Используются **относительные пути** (без алиаса `@/`), чтобы Metro стабильно находил картинки.

---

## Фон на ВСЕ экраны приложения

**Файл:** `app/_layout.tsx`.  
Меняется **одна строка** — та, где объявлена переменная `GLOBAL_BACKGROUND` (сразу под комментарием про фон). Должна быть **только одна** такая строка без `//` в начале.

### Вариант 1: без фона

Вся строка целиком должна быть **ровно такая** (в конце — `null` и точка с запятой):

```tsx
const GLOBAL_BACKGROUND: import("react-native").ImageSourcePropType | null = null;
```

Никакого `require`, только `null`. Тогда фоновой картинки не будет.

---

### Вариант 2: с фоновой картинкой

Вся строка целиком должна быть **ровно такая** (у `require` **две скобки** — `(` и `)` перед `;`):

```tsx
const GLOBAL_BACKGROUND: import("react-native").ImageSourcePropType | null = require("../assets/images/egonext-bg.png");
```

- Путь **относительно папки `app/`**: картинки из `assets/images/` задаются как `../assets/images/имя-файла.png`.
- Если картинка в **корне проекта** (рядом с `app/`): `../egonext-bg.png`.

Написание: `require("путь");` — путь в кавычках, **закрывающая скобка `)` перед `;`**. Без неё будет ошибка.

---

**Итог по `app/_layout.tsx`:** активна одна строка с `GLOBAL_BACKGROUND`: либо `= null;` (без фона), либо `= require("...");` (с фоном). Путь в `require` — относительный от `app/`.

---

## Фон только в разделе «Настройки»

**Файл:** `app/settings/_layout.tsx`.  
Меняется строка с переменной `SETTINGS_BACKGROUND` (под комментарием про фон настроек).

### Без фона — строка целиком:

```tsx
const SETTINGS_BACKGROUND = null;
```

### С фоном — строка целиком (у `require` обе скобки: `(` и `)`):

```tsx
const SETTINGS_BACKGROUND = require("../../assets/images/settings-bg.png");
```

Путь **относительно папки `app/settings/`**: картинки из `assets/images/` задаются как `../../assets/images/имя-файла.png`. Закрывающая `)` перед `;` обязательна.

---

## Куда класть файлы картинок и какие пути писать

| Куда положили файл | В `app/_layout.tsx` | В `app/settings/_layout.tsx` |
|-------------------|---------------------|------------------------------|
| `assets/images/egonext-bg.png` | `require("../assets/images/egonext-bg.png")` | — |
| `assets/images/settings-bg.png` | — | `require("../../assets/images/settings-bg.png")` |
| Корень проекта `egonext-bg.png` | `require("../egonext-bg.png")` | — |

Подходят форматы: `.png`, `.jpg`, `.jpeg`. Файл должен быть обычным PNG/JPG (не HEIF с переименованным расширением), иначе Metro может выдать ошибку.

---

## Фон на один конкретный экран

Если нужен фон только на одном экране (не на всех и не в целой группе), используйте `ImageBackground` прямо в файле этого экрана. Путь в `require` — **относительно этого файла**. Например, для экрана в `app/places/profile.tsx` картинка из `assets/images/` задаётся так:

```tsx
import { ImageBackground, View, StyleSheet } from "react-native";

const bgImage = require("../../assets/images/profile-bg.png");

export default function ProfileScreen() {
  return (
    <ImageBackground source={bgImage} style={styles.background} resizeMode="cover">
      <View style={styles.content}>
        {/* контент экрана */}
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

## Краткая шпаргалка

| Где фон | Файл | Без фона | С фоном (относительный путь) |
|--------|------|----------|------------------------------|
| Все экраны | `app/_layout.tsx` | `= null;` | `= require("../assets/images/egonext-bg.png");` |
| Только Настройки | `app/settings/_layout.tsx` | `= null;` | `= require("../../assets/images/settings-bg.png");` |

Важно: в `require("путь")` обязательно **две скобки** — `require("...")`. Компонент `lib/BackgroundLayout.tsx` менять не нужно.
