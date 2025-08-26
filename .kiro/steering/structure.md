---
inclusion: always
---

# Project Structure & Architecture Patterns

## File Organization

### App Router Structure (`src/app/`)

```
src/app/
├── (with-navbar)/           # Layout group with navigation
│   ├── (articles-and-pages)/ # Public content routes
│   ├── (protected-routes)/   # Authenticated routes
│   └── layout.tsx           # Shared layout with navbar
├── api/                     # API route handlers
├── actions/                 # Server actions
└── studio/                  # Sanity CMS interface
```

### Component Architecture (`src/components/`)

- **Domain-driven organization** - Group by feature/domain, not by type
- **Barrel exports** - Use `index.tsx` files for clean imports
- **Co-location** - Keep related files (tests, styles, types) together

```
src/components/
├── sections/        # Layout components (Navbar, Footer)
├── pages/          # Page-specific components
├── shared/         # Cross-domain reusable components
├── userAdmin/      # User management domain
└── document-library/ # Document handling domain
```

## Naming Conventions

- **Files**: `kebab-case.tsx` for pages, `PascalCase.tsx` for components
- **Components**: `PascalCase` with descriptive, domain-specific names
- **Hooks**: `use` prefix (e.g., `useModalState`)
- **Types**: `PascalCase` with `Type` or `Interface` suffix when needed
- **Constants**: `SCREAMING_SNAKE_CASE`

## Architecture Patterns

### Component Patterns

- **Server Components first** - Default to Server Components, use Client Components only when needed
- **Props interface** - Always define TypeScript interfaces for component props
- **Single responsibility** - Each component should have one clear purpose
- **Composition over inheritance** - Use component composition patterns

### Data Fetching

- **Server Components** - Fetch data directly in Server Components
- **GROQ queries** - Centralize in `src/sanity/lib/queries.ts`
- **Type safety** - Use generated Sanity types from `pnpm typegen`
- **Error boundaries** - Implement `error.tsx` for route-level error handling

### State Management

- **React Context** - For cross-component state (see `src/context/`)
- **Server Actions** - For form submissions and mutations
- **URL state** - Use searchParams for filters and pagination
- **Local state** - useState for component-specific state only

### Route Protection

- **Middleware** - Route-level protection in `src/middleware.ts`
- **Role-based access** - Check user roles in components and actions
- **Graceful fallbacks** - Show appropriate UI for unauthorized users

## Import Conventions

```typescript
// External libraries first
import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs";

// Internal imports by proximity
import { getUserRoles } from "@/lib/userUtils";
import { Button } from "@/components/shared";
import type { UserRole } from "@/types/types";
```

## Testing Structure

- **Co-located tests** - Place `.test.tsx` files next to components
- **Test utilities** - Shared test helpers in `src/test-utils/`
- **Mock data** - Create reusable mock objects for consistent testing
