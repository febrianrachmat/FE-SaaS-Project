# FlowPilot Web — Deployment Guide

## Target

Deploy the Next.js 15 app to **Vercel**.

## Environment variables

Set in Vercel Project Settings → Environment Variables:

| Key | Example |
|-----|---------|
| `NEXT_PUBLIC_APP_NAME` | `FlowPilot` |
| `NEXT_PUBLIC_APP_URL` | `https://flowpilot.vercel.app` |
| `NEXT_PUBLIC_API_URL` | `https://api.yourdomain.com/v1` |

## Deploy

### Via Vercel dashboard

1. Import `febrianrachmat/FE-SaaS-Project`
2. Framework preset: Next.js
3. Add env vars above
4. Deploy

### Via CLI

```bash
npm i -g vercel
vercel --prod
```

## CORS

Ensure the backend `FRONTEND_URL` matches the Vercel URL exactly (including `https://`).

## Accessibility baseline

- Skip-to-content link on app shell
- Keyboard support for search (`⌘K` / `Ctrl+K`) and Kanban cards
- Focus-visible rings on interactive controls
- ARIA labels on icon-only buttons

## Google sign-in

Login/register use `NEXT_PUBLIC_API_URL/auth/google` (full redirect). Ensure the API has Google OAuth env vars configured.

## CI

GitHub Actions: `npm ci` → lint → unit tests → production build on `main` / `develop`.
