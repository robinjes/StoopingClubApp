# Stooping Club App

Mobile app for [Berkeley Stooping Club](https://berkeleystooping.org) — a free community store for preloved household items. Browse inventory, add items to your cart, check out through Shopify, and manage your account.

Built with **Expo** and **React Native** (TypeScript).

## Stack

- [Expo SDK 54](https://docs.expo.dev/) + React Native
- [React Navigation](https://reactnavigation.org/) — bottom tabs, stack navigators, overlay screens
- [NativeWind](https://www.nativewind.dev/) — Tailwind-style styling
- [Zustand](https://zustand.docs.pmnd.rs/) — lightweight client state
- [Shopify Storefront API](https://shopify.dev/docs/api/storefront) — products, collections, cart, checkout
- [Shopify Customer Account API](https://shopify.dev/docs/api/customer) — profile, orders, pickup confirmation
- [expo-notifications](https://docs.expo.dev/versions/latest/sdk/notifications/) — order confirmations and pickup reminders

## Features

### Home
- Hero, impact stats, featured categories, recently viewed items, and happy customers gallery
- Quick link to browse the shop

### Shop
Four browse modes, switchable from the shop toolbar:
- **Grid** — standard product grid with search
- **Collections** — filter by pickup location and category (multi-select supported, with clear filters)
- **Stroll** — full-screen swipeable product cards
- **New** — new arrivals

### Cart & checkout
- Add to cart from grid, collections, stroll, wishlist, and product detail
- Checkout opens Shopify checkout in an in-app WebView
- Order confirmation message + local notification after checkout

### Account
- **Profile** opens the hosted Shopify customer account (`account.berkeleystooping.org/orders`) in a WebView
- Theme toggle (light / dark) in the account menu

### Wishlist
- Save items locally; badge on the tab bar

### Notifications
- Friday order reminder and Sunday pickup reminder (scheduled on device)
- Order confirmation notification after checkout

### Other
- Donate overlay, contact form, About Us, Get Involved
- Pickup / no-show screen (available from Home stack)

## Getting started

### Prerequisites

- Node.js 18+
- [Expo Go](https://expo.dev/go) on a physical device (recommended), or iOS Simulator / Android emulator
- Shopify Storefront API and Customer Account API credentials

### Setup

1. Clone the repo and install dependencies:

```bash
git clone https://github.com/robinjes/StoopingClubApp.git
cd StoopingClubApp
npm install
```

2. Copy `.env.example` to `.env` and fill in your Shopify values:

```bash
cp .env.example .env
```

| Variable | Purpose |
|----------|---------|
| `EXPO_PUBLIC_SHOPIFY_STORE_DOMAIN` | Store domain (e.g. `your-store.myshopify.com`) |
| `EXPO_PUBLIC_SHOPIFY_SHOP_ID` | Numeric shop ID |
| `EXPO_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN` | Storefront API access token |
| `EXPO_PUBLIC_SHOPIFY_API_VERSION` | API version (default `2024-10`) |
| `EXPO_PUBLIC_SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID` | Customer Account API client ID |

3. In **Shopify Admin → Headless → Customer Account API**, register the OAuth callback:

```
shop.<SHOP_ID>.app://account/callback
```

4. Start the dev server:

```bash
npx expo start
```

Use `npx expo start -c` after changing `.env`, NativeWind, or Metro config.

### Run on a device

```bash
npm run ios      # iOS Simulator
npm run android  # Android emulator
```

Or scan the QR code with **Expo Go** (iOS Camera or Android Expo Go app).

For remote testing while your laptop is running: `npx expo start --tunnel`

> **Note:** Local notifications require a physical device and permission. Some notification features are limited in Expo Go; use an EAS development build for full notification support.

## Project structure

```
src/
  api/              # GraphQL queries (products, collections, customer orders)
  components/       # UI components (home, shop, layout)
  context/          # React context (cart, customer, theme, overlays)
  data/             # Static content and category definitions
  hooks/            # Custom hooks
  navigation/       # Tab bar, stacks, overlays
  screens/          # Screen components
  services/         # Shopify clients, notifications, contact form
  store/            # Zustand stores
  utils/            # Filters, formatting, search helpers
```

## Navigation

**Primary tabs:** Home · Shop · Wishlist · Donate · About Us · Get Involved

**Overlays** (slide over tabs, tab bar stays visible): Cart · Donate · Contact · Account

**Shop modes** (within Shop tab): Grid · Collections · Stroll · New

## Shopify APIs

| API | Used for |
|-----|----------|
| **Storefront API** | Product catalog, collections, cart, checkout URL |
| **Customer Account API** | Profile, order history, pickup confirmation, no-show tracking |

Both must be configured for the full experience. Browsing and checkout work with Storefront API alone; account-specific features need Customer Account API credentials.

## Dev tools

In development builds (`__DEV__`), two test notification buttons appear in the top navbar next to the logo:

- **Receipt icon** — test order confirmation message
- **Bell icon** — test Sunday pickup reminder

## Sharing with testers

For a link others can open without your dev server running, set up [EAS Build](https://docs.expo.dev/build/introduction/) preview/internal distribution (TestFlight on iOS, internal APK on Android). This is the recommended path before App Store / Play Store release.

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo dev server |
| `npm run ios` | Open in iOS Simulator |
| `npm run android` | Open in Android emulator |
| `npm run web` | Open in web browser |

## License

Private — Berkeley Stooping Club.
