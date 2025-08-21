---
inclusion: always
---

# Technology Stack & Development Guidelines

## Core Stack

- **Next.js 15.3.1** with App Router - Use Server Components by default, Client Components only when needed
- **React 19.1.0** - Prefer functional components with hooks
- **TypeScript 5.7.2** - Strict mode enabled, always type function parameters and returns
- **pnpm** - Package manager (never use npm or yarn)

## Styling Standards

- **Tailwind CSS 3.4.3** - Use utility classes, avoid custom CSS when possible
- **HeroUI (NextUI) 2.6.14** - Primary component library for UI elements
- **Responsive design** - Mobile-first approach with `sm:`, `md:`, `lg:` breakpoints
- **Dark mode** - Support via next-themes, test both light and dark variants

## Content & Data

- **Sanity CMS** - All content management through Sanity Studio
- **GROQ queries** - Use typed queries in `src/sanity/lib/queries.ts`
- **Portable Text** - Rich content rendering with `@portabletext/react`
- **Image optimization** - Use Sanity CDN with Next.js Image component

## Authentication & Security

- **Clerk** - Norwegian locale (nb-NO), role-based permissions
- **Server Actions** - Prefer over API routes for mutations
- **Middleware** - Route protection in `src/middleware.ts`
- **Environment variables** - Use `.env.local` for development

## Code Quality

- **ESLint** - Follow Next.js recommended config
- **Prettier** - Auto-format on save
- **TypeScript strict** - No `any` types, proper error handling
- **Testing** - Vitest for unit tests, React Testing Library for components

## Development Commands

```bash
pnpm dev              # Development with Turbopack
pnpm build            # Production build
pnpm lint             # ESLint check
pnpm typegen          # Generate Sanity types
```

## Performance Guidelines

- Use `loading.tsx` for route-level loading states
- Implement proper error boundaries with `error.tsx`
- Optimize images with Next.js Image component
- Use React.memo() sparingly, only for expensive renders
