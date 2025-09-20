# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Dev server**: `pnpm run dev` (uses turbopack for fast builds)
- **Build**: `pnpm run build`
- **Lint**: `pnpm run lint`
- **Test**: `pnpm run test` (uses Vitest)
- **Test single file**: `pnpm run test <path-to-test-file>`
- **Coverage**: `pnpm run coverage`
- **Type generation**: `pnpm run typegen` (generates Sanity schema types)
- **Package manager**: Always use `pnpm`, never npm/yarn

## Architecture Overview

This is a Next.js 15 application using the App Router with TypeScript, serving as a housing cooperative website with authentication, content management, and member features.

### Tech Stack
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: HeroUI components + Tailwind CSS
- **CMS**: Sanity (headless CMS with studio at `/studio`)
- **Auth**: Clerk (Norwegian localization)
- **Database**: Upstash Redis for caching
- **Testing**: Vitest + React Testing Library

### Project Structure
```
src/
├── app/
│   ├── (with-navbar)/           # Layout group with navigation
│   │   ├── (articles-and-pages)/ # Public content pages
│   │   ├── (protected-routes)/   # Member-only pages
│   │   └── sign-in|sign-up/     # Auth pages
│   ├── api/                     # Next.js API routes
│   ├── actions/                 # Server actions
│   └── layout.tsx              # Root layout with providers
├── components/
│   ├── sections/               # Layout components (Navbar, Footer)
│   ├── pages/                  # Page-specific components
│   └── shared/                 # Reusable components
├── sanity/
│   ├── schemas/                # Sanity schema definitions
│   └── lib/                    # Sanity client configuration
└── lib/                        # Utilities and constants
```

### Key Features
- **Protected Routes**: Member-only areas using Clerk authentication
- **Message Board**: Internal communication system with comments
- **Document Library**: Meeting minutes and official documents
- **Content Management**: Pages and blog posts via Sanity CMS
- **User Roles**: Admin controls for user management
- **Draft Mode**: Content preview functionality

### Sanity Integration
- Studio accessible at `/studio` route
- Schema uses `defineType`, `defineField`, `defineArrayMember` helpers
- Norwegian localization enabled
- Live preview with Visual Editing
- Separate read/write clients for different access levels

### Authentication & Authorization
- Clerk handles authentication with Norwegian localization
- Role-based access control for admin features
- User subscription status tracking
- Server actions for user management

## Code Style Guidelines

- **Language**: TypeScript everywhere, prefer `type` over `interface`
- **Components**: Functional components, prefer React Server Components
- **Naming**: PascalCase for components/types, camelCase for variables/functions
- **Imports**: Use `@/` alias for absolute imports
- **Styling**: Mobile-first responsive design with HeroUI + Tailwind
- **Error Handling**: Try/catch for async operations, proper error boundaries
- **Testing**: Vitest + React Testing Library (never Jest)

## Sanity Specific Rules

- No single reference fields (always use arrays)
- Use SCREAMING_SNAKE_CASE for GROQ query variables
- Follow existing schema patterns in `/src/sanity/schemas/`

## Development Notes

- Norwegian UI text preferred where applicable
- Follow existing patterns when adding new features
- Use context7 MCP server for documentation when available
- Always wrap client components in Suspense for better performance