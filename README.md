# Riot

Mobile-first events application built with Next.js, Konsta UI, and Tailwind CSS. Designed to look and feel like a native iOS/Android app, with PWA support for installable web access.

## Tech Stack

| Layer         | Technology                                                               |
| ------------- | ------------------------------------------------------------------------ |
| Framework     | [Next.js 16](https://nextjs.org) (App Router, Turbopack)                 |
| Language      | TypeScript 5                                                             |
| Styling       | [Tailwind CSS v4](https://tailwindcss.com) (CSS-first config)            |
| UI Components | [Konsta UI](https://konstaui.com) (iOS theme)                            |
| PWA           | [@ducanh2912/next-pwa](https://github.com/nicedoc/next-pwa)              |
| Backend       | [Payload CMS v3](https://payloadcms.com) (separate repo: `riot-backend`) |

## Prerequisites

- **Node.js** >= 20 (22+ recommended)
- **npm** >= 10
- **riot-backend** running locally on port 3000 (or configure `NEXT_PUBLIC_API_URL`)

## Getting Started

```bash
# Clone and install
git clone <repo-url> riot-frontend
cd riot-frontend
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your backend URL

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser (or use your phone on the same network via the Network URL printed in the terminal).

## Scripts

| Command         | Description                         |
| --------------- | ----------------------------------- |
| `npm run dev`   | Start dev server with Turbopack HMR |
| `npm run build` | Production build                    |
| `npm run start` | Serve production build              |
| `npm run lint`  | Run ESLint                          |

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

| Variable              | Description                  | Default                 |
| --------------------- | ---------------------------- | ----------------------- |
| `NEXT_PUBLIC_API_URL` | Payload CMS backend base URL | `http://localhost:3000` |

## Project Structure

```
src/
├── app/
│   ├── globals.css         Tailwind + Konsta UI theme imports
│   ├── layout.tsx          Root layout (metadata, viewport, fonts)
│   ├── manifest.ts         PWA manifest (Next.js Metadata API)
│   ├── page.tsx            Home route (server component)
│   └── providers.tsx       Client-side Konsta <App> provider
└── components/
    └── HomeScreen.tsx      Main screen with Navbar + Tabbar
public/
└── icons/
    ├── icon-192x192.png    PWA icon (192x192) — placeholder
    └── icon-512x512.png    PWA icon (512x512) — placeholder
```

## Architecture Notes

### Server vs Client Components

Konsta UI components use React context and DOM APIs, so they require the `'use client'` directive. The boundary is drawn at:

- **Server components**: `layout.tsx`, `page.tsx`, and any future data-fetching pages
- **Client components**: `providers.tsx`, `HomeScreen.tsx`, and any component importing from `konsta/react`

This keeps data fetching and routing on the server while interactive UI runs on the client.

### Tailwind v4

This project uses Tailwind v4's CSS-first configuration. There is no `tailwind.config.ts`. Theme customization lives in `globals.css` via `@theme` directives. Konsta UI's theme is imported as a CSS file (`konsta/react/theme.css`).

### PWA

Service worker generation is handled by `@ducanh2912/next-pwa` and is **disabled in development** to avoid caching issues during local iteration. In production builds, it generates `sw.js` and `workbox-*.js` in `public/` (gitignored).

The manifest is defined in `src/app/manifest.ts` using the Next.js Metadata API, which serves it at `/manifest.webmanifest`.

### Backend Integration

The frontend uses the **Payload REST API SDK** (`@payloadcms/sdk`) to talk to `riot-backend`. The SDK is configured in `src/lib/sdk.ts` with `baseURL` from `NEXT_PUBLIC_API_URL` (supports a different hostname, e.g. staging). All collection types come from `src/lib/payload-types.ts`, which is synced from the backend—after changing the backend schema, copy `riot-backend/src/payload-types.ts` to `src/lib/payload-types.ts`.

- **Auth**: `sdk.login()`, `sdk.me()`, etc. (JWT or cookie per backend)
- **Public data**: `getEvents`, `getEvent`, `getCategories`, `getVenue` in `src/lib/api.ts` (SDK `find` / `findByID`)
- **Custom endpoints**: use `payload.request({ method, path, json })` for non-collection routes

### Future: Native Apps (Capacitor)

Capacitor integration is planned for wrapping the app into native `.ipa` and `.apk` builds. This will use Next.js static export (`output: 'export'`) with `webDir` pointing to the `out/` directory. This is not yet configured.

## Deployment

The app is deployed via **Coolify** as a standalone Next.js SSR application.

```bash
npm run build
npm run start
```

The production server listens on port 3000 by default. Set the `PORT` environment variable to change it.

## Code Quality

```bash
# Lint
npm run lint

# Format (check)
npx prettier --check "src/**/*"

# Format (fix)
npx prettier --write "src/**/*"
```

Prettier is configured in `prettier.config.js` with single quotes, trailing commas, and 2-space indentation.
