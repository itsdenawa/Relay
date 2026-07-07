# Relay

Relay is a project management app for small teams. It helps organize workspaces,
projects, Kanban boards, tasks, comments, and private attachments in one place.

Live app: [relay-vert-seven.vercel.app](https://relay-vert-seven.vercel.app)

## Stack

- Next.js App Router
- TypeScript
- Supabase Auth, Database, Realtime, and Storage
- Tailwind CSS
- TanStack Query
- Playwright
- Vitest
- Vercel

## Requirements

- Node.js 20.9 or newer
- pnpm 11.8.0
- Docker Desktop, or another Docker-compatible runtime, for local Supabase

## Getting started

Install dependencies:

```bash
pnpm install
```

Create a local environment file:

```bash
cp .env.example .env
```

Start Supabase:

```bash
pnpm db:start
```

Copy the local Supabase URL and publishable key printed by the CLI into `.env`.

Run the app:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Useful commands

```bash
pnpm check        # format, lint, types, and unit tests
pnpm test:e2e     # Playwright tests; requires local Supabase
pnpm build        # production build
pnpm db:verify    # reset local DB, run migrations, RLS tests, and type checks
pnpm db:types     # regenerate Supabase TypeScript types
```

## Project structure

The app uses an FSD-inspired structure adapted for the Next.js App Router:

```text
src/
├── app/       routes, layouts, providers, and global styles
├── views/     route-level page compositions
├── widgets/   large reusable UI sections
├── features/  user actions and business flows
├── entities/  domain models and entity UI
└── shared/    UI primitives, config, utilities, and API clients
```

More details are available in the `docs/` directory.
