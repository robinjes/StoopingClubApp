# StoopingClubApp

stoopingclub app submission - StephenCurryGlazers

## Stack

- Expo (TypeScript)
- React Navigation (bottom tabs + per-tab stack navigators)
- NativeWind (Tailwind CSS for React Native)

## Getting started

```bash
npm install
npx expo start
```

Use `npx expo start -c` after changing NativeWind or Metro config.

## Navigation

- **Grid**, **Collections**, and **Stroll** are bottom tabs.
- Each tab has its own stack navigator so product detail screens can be pushed independently.
