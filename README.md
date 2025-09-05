# My Finance

A cross-platform personal finance app built with React Native and Expo.

## Run the app

### Prerequisites

- Node.js 22.13 or newer
- An npm-compatible package manager (npm is used below)
- Expo Go on a physical device, or an Android emulator / iOS Simulator
- A Clerk application and Neon Postgres database

### Configure environment variables

Create a `.env` file in the project root with the credentials for your Clerk and Neon projects:

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
DATABASE_URL=postgresql://...
```

`EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` is required by the Expo client. `CLERK_SECRET_KEY` and `DATABASE_URL` are used by the API routes. The database must contain a `users` table with `email`, `clerk_id`, `assets`, and `created_at` columns; `clerk_id` should be unique and `assets` should support JSON values.

### Install dependencies

```bash
npm install
```

### Start Expo

```bash
npm start
```

Expo will display a QR code and launch options in the terminal. Scan the QR code with Expo Go, or choose a target from the terminal.

### Run a specific platform

```bash
# iOS Simulator
npm run ios

# Android emulator or connected Android device
npm run android

# Web browser
npm run web
```

### Check code quality

```bash
npm run lint
```
