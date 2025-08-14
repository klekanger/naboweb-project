# Project Structure

## Root Directory

- **Configuration files**: Next.js, Tailwind, TypeScript, ESLint, Prettier configs
- **Sanity files**: `sanity.config.ts`, `sanity.cli.ts` for CMS configuration
- **Package management**: `pnpm-lock.yaml`, `.npmrc`

## Source Structure (`src/`)

### App Directory (`src/app/`)

Uses Next.js App Router with route groups:

- **`(with-navbar)/`** - Pages that include the navigation bar
  - **`(articles-and-pages)/`** - Public content pages
    - `[slug]/` - Dynamic page routes
    - `blog/` - Blog functionality
    - `blog-collection/` - Blog listing with pagination
  - **`(protected-routes)/`** - Authenticated user areas
  - `sign-in/`, `sign-up/` - Authentication pages
- **`api/`** - API routes for backend functionality
  - Comment management, message board, email alerts
  - Sanity integration endpoints
  - Draft mode and revalidation
- **`studio/`** - Sanity Studio CMS interface
- **`actions/`** - Server actions for user management

### Components (`src/components/`)

Organized by functionality:

- **`sections/`** - Layout components (Navbar, Footer, Hero)
- **`pages/`** - Page-specific components (MessageBoard)
- **`shared/`** - Reusable components (ContentEditor, ImageUploader)
- **`userAdmin/`** - User management components
- **`document-library/`** - Document handling components
- **`icons/`** - Custom icon components
- **`common/`** - Generic reusable components

### Sanity CMS (`src/sanity/`)

- **`lib/`** - Client configuration, queries, utilities
- **`schemas/`** - Content type definitions
  - `documents/` - Main content types (blog, page, message)
  - `objects/` - Reusable schema objects
  - `singletons/` - Single-instance content (settings, hero)
- **`plugins/`** - Custom Sanity plugins

### Supporting Directories

- **`lib/`** - Utility functions, constants, validation
- **`types/`** - TypeScript type definitions
- **`context/`** - React context providers
- **`hooks/`** - Custom React hooks

## Naming Conventions

- **Files**: kebab-case for pages, PascalCase for components
- **Components**: PascalCase with descriptive names
- **API routes**: kebab-case following REST conventions
- **Sanity schemas**: camelCase for schema names

## Route Groups

- `(with-navbar)` - Pages with navigation
- `(articles-and-pages)` - Public content
- `(protected-routes)` - Authenticated areas
- `[[...tool]]` - Catch-all routes for Sanity Studio

## Key Patterns

- Server Components by default, Client Components marked with "use client"
- Co-located API routes with related functionality
- Centralized type definitions in `src/types/`
- Modular component organization by feature/domain
