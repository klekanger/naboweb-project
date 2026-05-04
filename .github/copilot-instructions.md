---
applyTo: "**"
---
# NaboWeb AI Coding Agent Instructions

## Architecture & Major Components

- **Framework**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: HeroUI + Tailwind CSS (mobile-first, responsive)
- **CMS**: Sanity (schemas in `studio/schemaTypes/`, Studio workspace at `studio/`)
- **Auth**: Clerk (Norwegian localization, role-based access)
- **Data**: Upstash Redis for caching
- **Testing**: Vitest + React Testing Library (never Jest)

### Key Directories
- `src/app/`: App Router structure, layouts, API routes, server actions
- `src/components/`: Page, section, shared, and user admin components
- `src/sanity/`: Sanity client, queries, loaders (no schema definitions; those live under `studio/schemaTypes/`)
- `src/lib/`: Utilities, constants, helpers

## Developer Workflows

- **Dev server**: `pnpm run dev` (turbopack)
- **Build**: `pnpm run build`
- **Lint**: `pnpm run lint`
- **Test**: `pnpm run test` or `pnpm run test <file>`
- **Coverage**: `pnpm run coverage`
- **Type generation**: `pnpm run typegen` (Sanity schema types)
- **Always use**: `pnpm` (never npm/yarn)

## Code Style & Patterns

- **TypeScript everywhere**; prefer `type` over `interface`
- **Functional components**; favor React Server Components (RSC)
- **Minimize** `use client`; use Suspense for client components
- **Naming**: PascalCase (components/types), camelCase (vars/functions), kebab-case (dirs)
- **Imports**: Use `@/` alias for absolute imports
- **Sanity**: Use `defineType`, `defineField`, `defineArrayMember` helpers; no single reference fields (always arrays)
- **GROQ queries**: SCREAMING_SNAKE_CASE for variables
- **Error handling**: try/catch for async ops, error boundaries in React
- **UI text**: Prefer Norwegian where applicable

## Integration & Cross-Component Patterns

- **Protected routes**: Use Clerk for member-only areas (`src/app/(protected-routes)/`)
- **Content management**: Pages, blog posts, and document library via Sanity
- **User management**: Server actions in `src/app/actions/`, role-based logic in `src/lib/currentUserRoles.ts`
- **Draft mode**: Content preview via Next.js and Sanity
- **Performance**: Optimize Web Vitals, use Suspense, lazy-load images (WebP preferred)

## Project-Specific Rules

- Follow existing patterns in codebase; reference similar files before adding new features
- Always wrap client components in Suspense
- Use context7 MCP server for documentation/examples when available

## Example Patterns

- **Sanity schema**: See `studio/schemaTypes/` for `defineType` usage
- **Server actions**: See `src/app/actions/` for user management
- **Role checks**: See `src/lib/currentUserRoles.ts`
- **Reusable components**: See `src/components/shared/`

---

Please review and suggest any missing or unclear sections for further refinement.