# Technology Stack

## Framework & Runtime

- **Next.js 15.3.1** - React framework with App Router
- **React 19.1.0** - UI library
- **TypeScript 5.7.2** - Type safety
- **Node.js** - Runtime environment

## Styling & UI

- **Tailwind CSS 3.4.3** - Utility-first CSS framework
- **HeroUI (NextUI) 2.6.14** - React component library
- **Framer Motion** - Animations
- **next-themes** - Dark/light mode support

## Content Management

- **Sanity 3.86.1** - Headless CMS
- **next-sanity** - Next.js integration
- **@portabletext/react** - Rich text rendering

## Authentication & User Management

- **Clerk** - Authentication provider with Norwegian localization
- **Role-based access control** - Custom user roles and permissions

## Database & Storage

- **Sanity** - Content storage
- **Upstash Redis** - Caching and session management

## Email & Notifications

- **Nodemailer** - Email sending
- **Sonner** - Toast notifications

## Development Tools

- **ESLint** - Code linting with Next.js config
- **Prettier** - Code formatting
- **pnpm** - Package manager

## Common Commands

```bash
# Development
pnpm dev              # Start development server with Turbopack
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint

# Sanity
pnpm typegen          # Generate Sanity types and move to src/types/
```

## Key Configurations

- **Turbopack** enabled for faster development builds
- **Image optimization** configured for Sanity CDN
- **Experimental taint** mode enabled
- **Norwegian locale** (nb-NO) throughout the application
