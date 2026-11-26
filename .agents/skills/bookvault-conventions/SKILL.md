---
name: bookvault-conventions
description: Project conventions and architecture rules for BookVault (Next.js 16, Repository layer, Zustand skipHydration, next-intl vi/en/zh, @xyflow/react v13, Google Books API).
---

# BookVault Project Conventions

Use this skill whenever modifying or extending the BookVault codebase.

## 1. Architecture & Data Layer
- **Repository Pattern (`src/services/repositories/`):** UI components and feature views must NEVER access `localStorage` directly. All reads and writes go through Zustand stores (`src/stores/*`), which delegate persistence to `repositories` (`interfaces.ts`, `mock/storageMockRepo.ts`, `api/apiRepo.ts`).
- **Switching Backend:** `NEXT_PUBLIC_DATA_SOURCE` (`mock` | `api`) selects the active repository implementation in `src/services/repositories/index.ts`.
- **Zustand Hydration (`skipHydration: true`):** Every persisted store uses `skipHydration: true` and is rehydrated client-side in `src/components/layout/StoreHydrator.tsx`. Client views gate rendering on `useHydrated()` to avoid SSR/CSR hydration mismatches.
- **JSON Backup Compatibility (`src/lib/backup.ts`):** Backup schemas support both `version: 1` (legacy without `caseboards`) and `version: 2` (with `caseboards`). Keep import backward-compatible when adding new entities.

## 2. Internationalization (`next-intl`)
- Supported locales: `vi` (default), `en`, `zh` defined in `src/i18n/config.ts`.
- Locale is stored in the `NEXT_LOCALE` cookie and resolved in `src/i18n/request.ts` without URL path prefixes.
- All three translation files (`messages/vi.json`, `messages/en.json`, `messages/zh.json`) **must maintain identical flattened keys**, enforced by `src/i18n/messages.test.ts`. Never hardcode user-visible UI strings in components.

## 3. Canvas & Diagrams (`@xyflow/react` v13)
- `@xyflow/react` v13.0.3 uses `OnNodesChange` / `OnEdgesChange` with `changes.applyTo(items)` rather than `applyNodeChanges` / `applyEdgeChanges`.
- Canvas components (`MindMapCanvas`, `DetectivePlaygroundCanvas`) must be `'use client'` and loaded via `next/dynamic(..., { ssr: false })`.

## 4. Server-Side Google Books Proxy
- Calls to `googleapis.com/books/v1/volumes` run exclusively in Next.js Route Handlers (`src/app/api/google/books/**`) using server-side `GOOGLE_BOOKS_API_KEY`.
- Client recommendations (`src/services/recommendation/`) gracefully fall back to `OFFLINE_RECOMMENDATION_POOL` when offline or rate-limited (HTTP 429).

## 5. Verification Commands
Run before completing any change:
- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`
