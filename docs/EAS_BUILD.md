# Сборка релизного APK через EAS Cloud

## Подготовка

1. **Аккаунт Expo**  
   Зарегистрируйтесь на [expo.dev](https://expo.dev), если ещё нет аккаунта.

2. **Вход в EAS** (один раз или при истечении сессии):
   ```powershell
   npx eas login
   ```
   Введите email/логин и пароль от аккаунта Expo.

## Сборка Android APK

Из корня проекта выполните:

```powershell
npm run build:android
```

или напрямую:

```powershell
npx eas build -p android --profile production
```

- Сборка выполняется в облаке EAS.
- В конце в консоли будет ссылка на скачивание APK (и в [expo.dev](https://expo.dev) → ваш проект → Builds).
- Профиль `production` в `eas.json` настроен на вывод **APK** (не AAB), чтобы файл можно было сразу ставить на устройство или раздавать вручную.

## Профили в eas.json

| Профиль       | Описание |
|---------------|----------|
| `development` | Для разработки с development client |
| `preview`     | Внутренняя раздача, APK |
| `production`  | Релизный APK для установки/раздачи |

Сборка другого профиля:

```powershell
npx eas build -p android --profile preview
```

## Первая сборка

При первом запуске EAS может спросить:

- **Create a new project?** — выберите Yes, чтобы привязать проект к аккаунту Expo (в каталоге появится/обновится привязка в Expo).
- Подписывание Android: по умолчанию EAS создаёт и хранит keystore в облаке (**credentialsSource: remote**). Это подходит для большинства случаев.

После успешной сборки APK можно скачать по ссылке из консоли или со страницы сборок на expo.dev.

## Если сборка упала с ошибкой Gradle

1. Откройте страницу сборки на [expo.dev](https://expo.dev) → ваш проект → Builds → выберите упавшую сборку.
2. Раскройте этап **«Run gradlew»** и посмотрите полный лог — там будет точная причина (например, несовместимая версия SDK, дубликат ресурсов и т.п.).
3. В проекте настроен плагин **expo-build-properties** (compileSdk 35, targetSdk 35) и поле **cli.appVersionSource** в eas.json — это уменьшает риск типичных ошибок Gradle.
4. Если вы вручную меняли папку `android/`, можно заново сгенерировать её:  
   `npx expo prebuild --platform android --clean`  
   (локальные правки в `android/` при этом будут перезаписаны.)
