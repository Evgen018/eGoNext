# Как изменить фоновое изображение

Пошаговая инструкция: где и что именно писать, чтобы включить или отключить фон. Указаны **полные строки** без сокращений.

---

## Фон на ВСЕ экраны приложения

**Файл:** `app/_layout.tsx`.  
Меняется **одна строка** — та, где объявлена переменная `GLOBAL_BACKGROUND` (сразу под комментарием «Фон для ВСЕХ экранов»). Должна быть **только одна** такая строка без `//` в начале.

### Вариант 1: без фона

Вся строка целиком должна быть **ровно такая** (в конце — `null` и точка с запятой):

```tsx
const GLOBAL_BACKGROUND: import("react-native").ImageSourcePropType | null = null;
```

Никакого `require`, только `null`. Тогда фоновой картинки не будет.

---

### Вариант 2: с фоновой картинкой

Вся строка целиком должна быть **ровно такая** (обратите внимание: у `require` **две скобки** — открывающая `(` после слова `require` и **обязательно закрывающая `)`** перед точкой с запятой):

```tsx
const GLOBAL_BACKGROUND: import("react-native").ImageSourcePropType | null = require("@/assets/images/egonext-bg.png");
```

- Вместо `@/assets/images/egonext-bg.png` подставьте свой путь к файлу (см. таблицу ниже).
- Написание: `require("путь");` — скобка после `require`, путь в кавычках, **закрывающая скобка `)` перед `;`**. Без этой скобки будет ошибка.

Если картинка лежит в **корне проекта** (например `egonext-bg.png`), строка будет такая:

```tsx
const GLOBAL_BACKGROUND: import("react-native").ImageSourcePropType | null = require("@/egonext-bg.png");
```

---

**Итог по `app/_layout.tsx`:** активна одна строка с `GLOBAL_BACKGROUND`: либо `= null;` (без фона), либо `= require("...");` (с фоном). В `require` обязательно писать путь в кавычках и не забывать закрывающую `)`.

---

## Фон только в разделе «Настройки»

**Файл:** `app/settings/_layout.tsx`.  
Меняется строка с переменной `SETTINGS_BACKGROUND` (под комментарием «Фон только для экранов внутри /settings»).

### Без фона — строка целиком:

```tsx
const SETTINGS_BACKGROUND = null;
```

### С фоном — строка целиком (у `require` обе скобки: `(` и `)`):

```tsx
const SETTINGS_BACKGROUND = require("@/assets/images/settings-bg.png");
```

Путь внутри кавычек можно заменить на свой; закрывающая `)` перед `;` обязательна.

---

## Куда класть файлы картинок

| Куда положили файл | Что писать в require |
|-------------------|----------------------|
| Корень проекта, например `egonext-bg.png` | `require("@/egonext-bg.png")` |
| Папка `assets/images/`, например `background.png` | `require("@/assets/images/background.png")` |

Подходят форматы: `.png`, `.jpg`, `.jpeg`.

---

## Фон на один конкретный экран

Если нужен фон только на одном экране (не на всех и не в целой группе), используйте `ImageBackground` прямо в файле этого экрана:

```tsx
import { ImageBackground, View, StyleSheet } from "react-native";

const bgImage = require("@/assets/images/profile-bg.png");

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

| Где фон | Файл | Без фона (полная строка) | С фоном (полная строка) |
|--------|------|---------------------------|--------------------------|
| Все экраны | `app/_layout.tsx` | `const GLOBAL_BACKGROUND: import("react-native").ImageSourcePropType \| null = null;` | `const GLOBAL_BACKGROUND: import("react-native").ImageSourcePropType \| null = require("@/assets/images/egonext-bg.png");` |
| Только Настройки | `app/settings/_layout.tsx` | `const SETTINGS_BACKGROUND = null;` | `const SETTINGS_BACKGROUND = require("@/assets/images/settings-bg.png");` |

Важно: в `require("путь")` обязательно **две скобки** — открывающая и закрывающая: `require("...")` — иначе будет ошибка. Компонент `lib/BackgroundLayout.tsx` менять не нужно.
