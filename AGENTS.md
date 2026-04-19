# AGENTS.md - Development Guide

## Commands

- **Build**: `pnpm run build`
- **Dev server**: `pnpm run dev` (with turbopack)
- **Lint**: `pnpm run lint`
- **Test all**: `pnpm run test`
- **Test single file**: `pnpm run test <path-to-test-file>`
- **Coverage**: `pnpm run coverage`
- **Type generation**: `pnpm run typegen`
- **Package manager**: Always use `pnpm`, never npm/yarn

## Code Style

- **Language**: TypeScript for all code, prefer `type` over `interface`
- **Components**: Functional components with React Server Components (RSC) preferred
- **Naming**: PascalCase for components/types, camelCase for variables/functions, kebab-case for directories
- **Imports**: Use absolute imports with `@/` alias
- **Error handling**: Use try/catch for async operations, proper error boundaries
- **Testing**: Use Vitest + React Testing Library (never Jest)

## Framework Guidelines

- **Next.js**: App Router, minimize 'use client', prefer server components
- **Styling**: HeroUI + Tailwind CSS with mobile-first responsive design
- **Sanity**: Use `defineType`, `defineField`, `defineArrayMember` helpers
- **Performance**: Optimize Web Vitals, wrap client components in Suspense

## Next.js: ALWAYS read docs before coding

- Before any Next.js work, find and read the relevant doc in `nextjs-app/node_modules/next/dist/docs/`. Your training data is outdated — the docs are the source of truth.

## Project Rules

- Follow existing patterns in codebase
- No single reference fields in Sanity (always arrays)
- Use SCREAMING_SNAKE_CASE for GROQ query variables
- Norwegian UI text where applicable
- ALWAYS use context7 mcp where applicable
