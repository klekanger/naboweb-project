# NaboWeb

**Websites and resident portals for Norwegian sameier and borettslag.**

🌐 **Website:** [https://naboweb-webpage.vercel.app/](https://naboweb-webpage.vercel.app/) (not maintained anymore)

🏡 **Live example:** [https://gartnerihagen-askim.no/](https://gartnerihagen-askim.no/), the website of Gartnerihagen Boligsameie, an existing *sameie* that runs on NaboWeb

NaboWeb is a website solution built from scratch for condominium associations (*sameier*) and housing cooperatives (*borettslag*). It gives the board (*styret*) one place to keep residents informed and gives prospective buyers a professional first impression. It also cuts down on inquiries to the board. Each site is tailored to its association's design, colours, logo and menus.

This repository powers the website for **Gartnerihagen Boligsameie (v2.0)** and is the codebase behind the NaboWeb product. Read more at [naboweb-webpage.vercel.app](https://naboweb-webpage.vercel.app/), or see the features in action on the [showcase page](https://naboweb-webpage.vercel.app/showcase).

### Features

- **Tailored public website**: front page, menus and content managed in Sanity, with customer-editable labels.
- **Closed resident area** (*lukket område*): login-protected pages and content for residents only.
- **Document archive** (*dokumentarkiv*): a searchable archive for AGM minutes, bylaws, house rules, waste calendars, house colour codes and more.
- **Blog and articles**: published by board members or editors, either public or visible only to logged-in residents.
- **Notice board and messaging** (*oppslagstavle*): the board can message all residents (dugnad, meeting invitations), residents can post notices, and everyone gets email notifications about new posts.
- **User administration**: the board can add, edit and remove residents as they move in and out, and give them roles (`user`, `editor`, `admin`).
- **Flexible login**: username/password or passwordless login via email links.

### Tech stack

- [Next.js](https://nextjs.org/) (App Router, React Server Components) hosted on Vercel
- [Sanity](https://www.sanity.io/) as the headless CMS, with Visual Editing
- [Clerk](https://clerk.com/) for authentication and role-based access control
- [HeroUI](https://heroui.com/) + Tailwind CSS for the UI
- AWS SES for email alerts, Upstash Redis for scheduling state
- Vitest + React Testing Library for tests

## Repository structure

This is a pnpm monorepo containing:

- **nextjs-app**: The Next.js application
- **studio**: Standalone Sanity Studio

## Getting Started

### Install Dependencies

```bash
pnpm install
```

### Environment Variables

Copy the example files and fill in your own values. Each file has comments on where to find every value (Sanity, Clerk, Upstash, AWS SES):

```bash
cp nextjs-app/.env.example nextjs-app/.env.local
cp studio/.env.example studio/.env.local
```

The Sanity project ID and dataset must be the same in both files.

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

## License

This project is **source-available**, licensed under the [Source-Available License 1.0](LICENSE.md).

You are free to use, copy, fork, modify, and share this software, including for internal use within commercial organizations.

**You may not:**
- Sell the software or modified versions.
- Incorporate the source code into commercial software products.
- Offer the software as a paid service or SaaS product.

Commercial use of the software within your own organization is permitted.

Commercial licensing is available upon request.

See [LICENSE](LICENSE.md) for the full terms.

**Note:** This project is source-available, not open source as defined by the Open Source Initiative.
