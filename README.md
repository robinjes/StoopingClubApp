# StoopingClubApp

stoopingclub app submission - StephenCurryGlazers

## Stack

- Expo (TypeScript)
- React Navigation (bottom tabs + per-tab stack navigators)
- NativeWind (Tailwind CSS for React Native)

## Getting started

1. Copy `.env.example` to `.env` in the project root.
2. Edit `.env` with your Shopify credentials (do not edit `.env.example` — it is only a template).
3. Install and start the app:

```bash
npm install
npx expo start
```

Restart Expo with `npx expo start -c` after changing `.env`, NativeWind, or Metro config.

## Navigation

- **Grid**, **Collections**, and **Stroll** are bottom tabs.
- Each tab has its own stack navigator so product detail screens can be pushed independently.
