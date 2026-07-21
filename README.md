# FlowPilot Frontend

Modern collaborative SaaS Project Management platform.

> Manage projects. Collaborate effortlessly. Deliver faster.

## Stack

- Next.js 15 (App Router)
- React 19 + TypeScript (strict)
- Tailwind CSS
- TanStack Query · Zustand · React Hook Form · Zod
- Lucide Icons · Motion

## Architecture

Feature-based folders under `src/features/*` with shared UI/lib in `src/shared/*`.

```
src/
  app/           # Next.js routes
  features/      # Domain features (auth, workspace, project, task…)
  shared/        # UI primitives, providers, stores, types
  config/        # Env & app config
```

## Getting started

```bash
cp .env.example .env.local
npm install
npm run dev
```

App: http://localhost:3000

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (Kanban positioning) |

## Deploy

See [DEPLOYMENT.md](./DEPLOYMENT.md) for Vercel setup and env vars.

## Related

Backend API: [BE-SaaS-Project](https://github.com/febrianrachmat/BE-SaaS-Project)
