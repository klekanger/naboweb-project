---
inclusion: always
---

# Development Guide for Gartnerihagen Boligsameie

## Tech Stack Rules

- **Next.js 15.3.1** App Router - Server Components default, Client Components only when needed
- **TypeScript 5.7.2** strict mode - Always type parameters/returns, NO `any` types
- **pnpm** only (never npm/yarn)
- **Tailwind CSS + HeroUI/NextUI** - Utility-first styling
- **Sanity CMS** with GROQ queries in `src/sanity/lib/queries.ts`
- **Clerk** authentication with Norwegian locale (nb-NO)

## Architecture Patterns

### File Organization

```
src/components/
├── sections/        # Layout components
├── pages/          # Page-specific components
├── shared/         # Cross-domain reusable
├── userAdmin/      # Domain-specific features
└── document-library/
```

### Naming Conventions

- Pages: `kebab-case.tsx`
- Components: `PascalCase.tsx`
- Hooks: `useHookName.ts`
- Types: `PascalCase` with `Type/Interface` suffix
- Constants: `SCREAMING_SNAKE_CASE`

### Import Order

```typescript
// 1. External libraries
import { NextRequest } from "next/server";
// 2. Internal by proximity
import { getUserRoles } from "@/lib/userUtils";
import type { UserRole } from "@/types/types";
```

## Data & State Management

- **Server Components** - Default for data fetching
- **Server Actions** - Preferred over API routes for mutations
- **React Context** - Cross-component state (`src/context/`)
- **URL state** - searchParams for filters/pagination
- **Local state** - useState for component-specific only
- Run `pnpm typegen` after Sanity schema changes

## Security & User Roles

1. **Public** - No auth, general content only
2. **Residents** - Authenticated, message board, documents
3. **Board Members** - All resident permissions + admin features

### Protection Patterns

- Route protection in `src/middleware.ts`
- Role validation in components/actions
- Graceful fallbacks for unauthorized users

## Norwegian Localization

- **Language**: Norwegian (nb-NO) for all user-facing content
- **Tone**: Formal Norwegian ("De" form) for official communications
- **Accessibility**: WCAG 2.1 AA compliance required
- **Mobile-first**: Primary access via mobile devices

## Testing & Quality

- **Vitest** with React Testing Library
- **Co-located tests** - `.test.tsx` files next to components
- **Test utilities** in `src/test-utils/`
- **ESLint** Next.js config, **Prettier** auto-format
- **Performance** target: <3s page load times

## Essential Commands

```bash
pnpm dev              # Development with Turbopack
pnpm build            # Production build
pnpm lint             # ESLint check
pnpm typegen          # Generate Sanity types
```

## Performance Guidelines

- Use `loading.tsx` for route-level loading states
- Implement `error.tsx` for error boundaries
- Optimize images with Next.js Image component
- Use React.memo() sparingly

## Context7 Documentation

Use Context7 MCP for unfamiliar libraries, troubleshooting, best practices, and TypeScript errors.
Priority sources: Next.js, Sanity, Clerk, Tailwind CSS, HeroUI/NextUI.

## Business Logic

### Message Board

- Residents: create/edit/delete own messages
- Board members: moderate all content
- Configurable email notifications

### Document Library

- Role-based access control
- File upload through Sanity with validation
- Categorized by type (meeting minutes, announcements)

### Critical Requirements

- GDPR compliance for EU residents
- 99.9% uptime for critical features
- Proper security for all user data
- Accessibility: alt text for images, form validation
