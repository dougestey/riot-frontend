# Role and Context

You are an expert Next.js, mobile hybrid app, and PWA developer. We are building the frontend for an events application.

**The Backend:** We already have a separate repository (`riot-backend`) running Payload CMS v3 on Node.js/PostgreSQL. It exposes a standard REST/GraphQL API for Users, Auth, and Events.
**The Frontend (This Project):** We are creating a new repository called `riot-frontend`. It must be completely decoupled from the backend.
**The Deployment:** It will be deployed via Coolify as a standalone Next.js SSR application.
**The Goal:** The web app needs to look and feel like a native mobile application (iOS/Android), function as a Progressive Web App (PWA) for offline/installable web access, and eventually be compiled into native `.ipa` and `.apk` files for the app stores.

# The Tech Stack

- **Framework:** Next.js 15+ (Strictly using the App Router).
- **Styling:** Tailwind CSS.
- **UI Components:** Konsta UI (React) for pixel-perfect native iOS and Material Design components using Tailwind.
- **PWA:** `@ducanh2912/next-pwa` (for Service Workers and caching).
- **Native Wrapper:** Capacitor (by Ionic) to wrap the Next.js `out` build into native apps.

# Your Task

This is a brand new project. All I've done is initialize git and add CLAUDE.md, PLAN.md (this prompt) and a prettier configuration.

Please analyze the sibling to this workspace, which is called riot-backend and provide the exact terminal commands and file configurations to bootstrap this project from scratch. I want you to walk me through the initialization in the following phases:

### Phase 1: Next.js & Tailwind Scaffolding

Provide the `npx create-next-app` command with the appropriate flags for TypeScript, Tailwind, App Router, and ESLint.

### Phase 2: Konsta UI Setup

Provide the installation commands for `konsta` and `react-konsta`.
Show me exactly how to modify the `tailwind.config.ts` file to wrap it in Konsta UI's `konstaConfig`, ensuring it plays nicely with the Next.js App Router. Provide a sample `layout.tsx` wrapper using Konsta's `<App>` provider.

### Phase 3: PWA Configuration

Provide the installation command for `@ducanh2912/next-pwa`.
Show me how to modify `next.config.mjs` (or `.ts`) to implement the `withPWA` wrapper. Include the basic settings needed for a production-ready Service Worker.
Generate a sample `manifest.json` for the `public` folder.

### Phase 4: Capacitor Initialization

Provide the installation commands for `@capacitor/core` and `@capacitor/cli`.
Walk me through the `npx cap init` step.
Explain how to configure `capacitor.config.ts` so that its `webDir` points to the correct Next.js build output directory (note: Next.js uses `.next` or `out` depending on the export type. Please advise on the best strategy for hybrid SSR + Capacitor exports).

### Phase 5: Initial Boilerplate

Generate a skeletal `app/page.tsx` that imports a native-looking Konsta UI Navbar and Bottom Tabbar, proving that the Tailwind/Konsta integration works.

**Guidelines for your response:**

- Keep the explanations concise; I am an experienced developer. Show me the code and the terminal commands.
- Keep Server-Side Rendering (SSR) in mind. Warn me if specific Konsta UI or Capacitor components require `'use client'` directives.
- Ensure all configurations target Next.js 15 standards.
