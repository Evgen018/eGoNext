# Сводка по проекту eGoNext

## 1. Назначение проекта
- Мобильное приложение **eGoNext — Дневник туриста** (Expo + React Native, TypeScript).
- Работает офлайн: все данные (места, поездки, фото) хранятся локально (SQLite + файловая система).

## 2. Стек и ключевые пакеты
- Expo 54 (React Native 0.81.5), Expo Router, React Native Paper.
- Хранилище: `expo-sqlite`, локальные фото — `expo-file-system`.
- Геолокация и камера/галерея: `expo-location`, `expo-image-picker`.
- Карты (Android/iOS): `react-native-maps` (используется только в нативной версии).

## 3. Недавние изменения
1. **Фотографии мест**: в формах добавления/редактирования доступен выбор фото через камеру или галерею (общий helper `lib/imagePicker.ts`).
2. **Места «на лету» при добавлении в поездку**: из экрана `trips/[id]/add-place` можно создать место и оно автоматически добавится в маршрут.
3. **Выбор координат на карте**:
   - Компонент `components/MapPickerScreen.native.tsx` с `react-native-maps`; маршрут `app/places/map-picker.tsx` реэкспортирует его (для web — `MapPickerScreen.web.tsx` с подсказкой).
   - Добавлена кнопка «Выбрать на карте» в формах добавления/редактирования места; координаты возвращаются через `MapPickerContext`.
4. **Инструкция для пользователя**: `docs/КАК_ПОЛЬЗОВАТЬСЯ.md`, ссылка в README.

## 4. Текущее состояние кода
- База данных и репозитории: `lib/db/...`.
- Экраны:
  - `app/index.tsx` — главная (Места / Поездки / Следующее место / Настройки).
  - `app/places/*` — режим «Места».
  - `app/trips/*` — режим «Поездки».
  - `app/next-place.tsx` — режим «Следующее место».
  - `app/settings/*` — настройки.
- Темная тема и фон управляются через `lib/theme-context.tsx` и `lib/BackgroundLayout.tsx`.

## 5. Известные проблемы / TODO
- ~~**Expo Web + `react-native-maps`**~~ **Исправлено**: экран выбора на карте вынесен из `app/places/` в `components/MapPickerScreen` (`.native.tsx` / `.web.tsx`). В `app/places/` остался один нейтральный маршрут `map-picker.tsx`, реэкспортирующий компонент. Для web Metro подключает только `MapPickerScreen.web.tsx`, без `react-native-maps`.
- Папка `.expo` всё ещё присутствует в репозитории GitHub; чтобы скрыть её, выполнить:
  ```powershell
  git rm -r --cached .expo
  git commit -m "Remove .expo from repository"
  git push
  ```

## 6. Полезные команды
```powershell
# запуск Expo
npx expo start          # dev server, QR-код для Expo Go
# проверка TypeScript
npx tsc --noEmit
```

## 7. Следующие шаги
1. ~~Исправить сборку web-версии~~ — сделано (нейтральный route + компонент вне `app/`).
2. Протестировать новые функции (камера/галерея, места «на лету», выбор на карте) на устройствах Android/iOS.
3. Удалить `.expo` из Git-репозитория и закоммитить очистку.

_Файл подготовлен для передачи контекста в новом чате._
