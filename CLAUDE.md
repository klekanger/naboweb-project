@AGENTS.md

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from the monorepo root unless noted otherwise.

- **Dev (all workspaces)**: `pnpm run dev`
- **Dev (Next.js only)**: `pnpm --filter @naboweb/nextjs-app dev`
- **Dev (Studio only)**: `pnpm run dev:studio`
- **Build**: `pnpm run build`
- **Test**: `pnpm run test`
- **Test single file**: `pnpm --filter @naboweb/nextjs-app test <path>`
- **Coverage**: `pnpm run coverage`
- **Type generation**: `pnpm run typegen` (runs `sanity schema extract && sanity typegen generate` in the studio workspace — re-run after any schema or GROQ query change)
- **Lint**: temporarily disabled pending Next.js 16 ESLint migration
- **Package manager**: Always `pnpm`, never npm/yarn

## Monorepo Structure

```
/ (root)
├── studio/                  # Sanity Studio (standalone @naboweb/studio)
│   ├── schemaTypes/        # Schema definitions for the studio
│   └── sanity.config.ts
├── nextjs-app/             # Next.js app (@naboweb/nextjs-app)
│   └── src/
│       ├── app/            # App Router pages, API routes, server actions
│       ├── components/     # React components
│       ├── sanity/         # Sanity client, queries, loaders (schemas live in studio/)
│       ├── lib/            # Utilities, constants, role validation
│       ├── hooks/          # Custom React hooks
│       ├── types/          # TypeScript types (includes generated sanity.types.ts)
│       └── test-utils/     # Vitest setup + mocks
└── package.json            # Monorepo scripts
```

## Next.js in this repo

The pinned `next` version is in `nextjs-app/package.json`. For App Router behavior and APIs (caching directives, `draftMode`, `revalidateTag`, `revalidatePath`, etc.), read the matching topic under `nextjs-app/node_modules/next/dist/docs/`. The rest of this file describes Naboweb-specific wiring only; `@AGENTS.md` (included above) covers shared conventions and repeats the local-docs rule.

## Key Architectural Patterns

### Sanity schema location

Content schema types are defined only in `studio/schemaTypes/` and registered in `studio/sanity.config.ts`. After any schema or GROQ query change, run `pnpm run typegen` to regenerate `nextjs-app/src/types/sanity.types.ts`.

### Clerk Auth Middleware

The middleware file is `nextjs-app/src/proxy.ts` (not `middleware.ts`). It protects `/min-side`, `/information`, `/user-admin-page`, and `/messageboard`. Layout-level checks in `(protected-routes)` enforce role-based access beyond basic auth.

### Role-Based Access Control

Roles (`"user"`, `"editor"`, `"admin"`) are stored in Clerk's `publicMetadata.roles` as an array. All new users must have at least the `"user"` role. Role validation lives in `src/lib/validateUserRoles.ts`. Auth checks are done inside server actions, not middleware.

### Sanity Clients

Two clients in `src/sanity/lib/client.ts`:

- `client`: read-only, stega enabled for Visual Editing overlays
- `clientWithWriteAccess`: write token for mutations via API routes

### Caching Strategy

For `"use cache"`, `cacheLife`, `cacheTag`, and cache invalidation APIs, follow the current docs in `nextjs-app/node_modules/next/dist/docs/`.

In this app: layouts and pages read **`draftMode`** and branch fetching accordingly; the Sanity loader uses preview vs published perspective when draft mode is enabled (`src/sanity/lib/store.ts`). The main Sanity webhook handler is `src/app/api/revalidate/route.ts`: it calls `revalidateTag` for the document `_type` and, when the payload includes `slug`, for `` `${_type}:${slug}` ``, and also calls `revalidatePath("/")` so the home route updates. Additional revalidation exists in `src/app/api/sanity/*` and path-based invalidation in `src/app/api/revalidate-messageboard/route.ts`.

### Server Actions Pattern

All Clerk user operations live in `src/app/actions/`. They return discriminated union types: `{ success, status }` | `{ error, status }`. Auth and role checks happen inside each action.

### Path pagination (App Router)

Public blog list uses `blog-collection/[[...blogPage]]`: page 1 is **`/blog-collection`** (canonical); page 2+ is **`/blog-collection/2`**, etc. Legacy **`/blog-collection/1`** redirects to `/blog-collection`. The same pattern applies to **`/information`** (optional `[[...page]]`). GROQ slices use helpers in `src/lib/pagination.ts` (`groqSliceRange`, `totalPagesFromCount`, `pageNumberFromOptionalCatchAll`). Link-style pagination UI is `@/components/Pagination` (pass `useRootUrlForFirstPage` for those index routes). Admin blog list stays **`/admin/blog/1`** (numeric segment; no optional catch-all next to `new/` and `[slug]/edit`).

### GROQ Queries

All queries live in `src/sanity/lib/queries.ts`. Use `defineQuery` from `groq` or `next-sanity` to wrap strings. Always use SCREAMING_SNAKE_CASE for query variable names. Each filter segment and projected attribute goes on its own line. Never interpolate dynamic values — use query parameters.

### Email Alerts + Cron

`/api/send-email-alerts` requires `Authorization: Bearer ${CRON_SECRET}` (Vercel cron) or `Bearer ${EMAIL_SECRET_TOKEN}` (manual). Sends batch emails via AWS SES (nodemailer). Upstash Redis tracks last run time and is also kept alive by `/api/ping-upstash` to prevent free-tier deletion.

### Testing

Vitest + React Testing Library. `src/test-utils/setup.ts` pre-mocks HeroUI components, Sanity image URLs, Next.js routing, server actions, and browser APIs. No real Next.js server or browser needed.

Code style, HeroUI + Tailwind, and RSC guidance: see `@AGENTS.md` above.

## Sanity Schema Conventions

- Always use `defineType`, `defineField`, `defineArrayMember` helpers
- Every `document`/`object` needs an `icon` from `@sanity/icons` and a customized `preview`
- `string` fields with `options.list` of fewer than 5 items must use `options.layout: "radio"`
- Every `image` field must have `options.hotspot: true`
- No `boolean` fields — use a `string` field with `options.list` instead
- Never use single `reference` fields — always wrap in an `array` of references
- Use `groups` for schema types with many fields; use `fieldsets` with `options: {columns: 2}` for visually related pairs
- Add `description` and `rule.warning()` / `rule.required().error()` where intent is non-obvious
- Schema type with a custom input component: colocate it as `[typeName]/index.ts`
