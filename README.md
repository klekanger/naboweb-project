# NaboWeb

## Gartnerihagen Boligsameie – v2.0

This is a monorepo containing:

- **nextjs-app**: The Next.js application
- **studio**: Standalone Sanity Studio

## Getting Started

### Install Dependencies

```bash
pnpm install
```

### Development

Run the Next.js app:

```bash
pnpm dev
# or
pnpm --filter @naboweb/nextjs-app dev
```

Run the Sanity Studio:

```bash
pnpm dev:studio
# or
pnpm --filter @naboweb/studio dev
```

The Next.js app runs on `http://localhost:3000` and the Studio runs on `http://localhost:3333`.

### Build

Build the Next.js app:

```bash
pnpm build
# or
pnpm --filter @naboweb/nextjs-app build
```

Build the Studio:

```bash
pnpm build:studio
# or
pnpm --filter @naboweb/studio build
```

### Type Generation

Generate Sanity types:

```bash
pnpm typegen
# or
pnpm --filter @naboweb/studio typegen
```
