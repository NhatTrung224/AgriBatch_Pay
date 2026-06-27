# AgriBatch Pay

[![CI](https://github.com/NhatTrung224/AgriBatch_Pay/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/NhatTrung224/AgriBatch_Pay/actions/workflows/ci.yml)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Railway-0B0D12?style=for-the-badge&logo=railway&logoColor=white)](https://agribatchpay-production.up.railway.app/)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-00E599?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Tests](https://img.shields.io/badge/Tests-6%20passing-22C55E?style=for-the-badge)](https://github.com/NhatTrung224/AgriBatch_Pay/actions/workflows/ci.yml)

AgriBatch Pay is a contract-ready crop settlement platform built with Next.js 16, internal API routes, Neon PostgreSQL, and Stellar wallet integrations. It focuses on the full-stack delivery surface for batch tracking, payout approval, realtime event streaming, submission evidence, and Railway deployment without splitting backend and frontend into separate services.

Important project note: this repository currently ships the web platform, database workflow, wallet integration points, event log, and delivery pipeline. Final Soroban contract source code and real deployed contract addresses are still pending the last on-chain deployment pass.

## Quick Links

- GitHub repository: https://github.com/NhatTrung224/AgriBatch_Pay
- Live demo: https://agribatchpay-production.up.railway.app/
- Submission surface: https://agribatchpay-production.up.railway.app/submission
- Healthcheck: https://agribatchpay-production.up.railway.app/api/health
- Demo video placeholder: https://agribatchpay-production.up.railway.app/

## Product Surfaces

- Landing page with project framing, architecture overview, and wallet context.
- Dashboard for batch KPIs, recent activity, and payout monitoring.
- Batch registry and batch detail workspace for creating, funding, quality confirmation, and settlement approval.
- Farmer payout board for tracking lot-level payout status.
- Realtime event stream backed by Server-Sent Events on `/api/events`.
- Submission evidence screen that surfaces delivery status, screenshots checklist, repo link, healthcheck, and transaction evidence.

## Tech Stack

| Layer | Implementation |
| --- | --- |
| Frontend | Next.js 16 App Router, React 19, Tailwind CSS 4, Motion |
| Internal API | Next.js route handlers under `src/app/api` |
| Database | Neon PostgreSQL |
| ORM | Drizzle ORM + Drizzle Kit |
| Validation | Zod |
| Wallets | Freighter and Rabet adapters |
| Testing | Vitest + Testing Library |
| CI/CD | GitHub Actions + Railway Docker deploy |
| Runtime health | `/api/health` + Docker healthcheck |

## Architecture Summary

The application is organized as a single Next.js codebase:

- UI routes live in `src/app/(platform)` and `src/app/page.tsx`.
- Internal APIs live in `src/app/api/*`.
- Domain services for batches, farmers, events, and submission evidence live in `src/features/*/server.ts`.
- PostgreSQL tables are defined in `src/lib/db/schema.ts`.
- Event streaming is implemented with SSE in `src/app/api/events/route.ts`.
- Deployment readiness is backed by `Dockerfile`, `railway.json`, and `.github/workflows/ci.yml`.

Core database tables:

- `batches`
- `farmer_lots`
- `wallet_interactions`
- `app_events`
- `submission_evidence`

## Requirements Coverage

| Requirement | Status | Current implementation |
| --- | --- | --- |
| Advanced smart contract development | Partial | The web platform and contract-ready workflow are implemented, but Soroban contract source files are not yet committed in this repository. |
| Inter-contract communication | Partial | The product model includes registry and payout vault modules, but final on-chain contract addresses are still pending deployment. |
| Event streaming and real-time updates | Ready | `/api/events` streams app and wallet events over SSE with reconnect logic in the client. |
| CI/CD pipeline setup | Ready | GitHub Actions runs `npm ci`, typecheck, lint, test, and build on push and pull request. |
| Smart contract deployment workflow | Partial | Submission evidence, contract placeholders, and transaction capture fields are present; final Soroban deployment values still need to be filled. |
| Mobile responsive frontend development | Ready | Landing, dashboard, batches, farmers, events, and submission views are responsive across desktop and mobile layouts. |
| Error handling and loading states | Ready | Route handlers use guarded error responses and realtime/event surfaces include reconnect states and empty states. |
| Writing tests for contracts and frontend | Partial | Frontend/app tests are present and passing. Contract tests depend on the final Soroban contract source drop. |
| Production-ready architecture practices | Ready | Single-codebase Next.js architecture, env-safe build flow, Neon persistence, Docker healthcheck, and Railway deployment are in place. |
| Documentation and demo presentation | Partial | README, design concept assets, live demo, and submission page are present. Recorded demo video is still pending and temporarily points to the live demo. |

## Submission Checklist

Ensure the project is reviewed against the current repository state, not against the old create-next-app scaffold.

| Item | Status | Evidence |
| --- | --- | --- |
| Public GitHub repository | Ready | https://github.com/NhatTrung224/AgriBatch_Pay |
| README with complete documentation | Ready | This file plus the live submission surface at `/submission` |
| Minimum 10+ meaningful commits | Ready | `git rev-list --count HEAD` is currently 20 |
| Live demo link | Ready | https://agribatchpay-production.up.railway.app/ |
| Contract deployment address | Pending | Final Soroban deployment address has not been published yet |
| Transaction hash for contract interaction | Demo placeholder | Current demo dataset stores `TEST-SETTLE-TX-001`; replace with a real Soroban transaction hash before final submission |
| Screenshot showing mobile responsive UI | Pending capture | Use the live demo for review until the final screenshot set is committed |
| Screenshot showing CI/CD pipeline running | Pending capture | Workflow link: https://github.com/NhatTrung224/AgriBatch_Pay/actions/workflows/ci.yml |
| Screenshot showing test output with 3+ passing tests | Pending capture | Current local verification: 6 passing Vitest tests plus lint, typecheck, and build passing |
| Demo video link (1-2 minutes) | Temporary placeholder | https://agribatchpay-production.up.railway.app/ |

## Local Development

1. Install dependencies:

```bash
npm ci
```

2. Create local environment file:

```bash
cp .env.example .env.local
```

3. Set `DATABASE_URL` in `.env.local` to your Neon PostgreSQL connection string.

4. Push the schema and seed the demo data:

```bash
npm run db:push
npm run db:seed
```

5. Start the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

Required server variable:

- `DATABASE_URL`

Supported public variables:

- `NEXT_PUBLIC_STELLAR_NETWORK`
- `NEXT_PUBLIC_STELLAR_RPC_URL`
- `NEXT_PUBLIC_HORIZON_URL`
- `NEXT_PUBLIC_EXPLORER_BASE_URL`
- `NEXT_PUBLIC_REGISTRY_CONTRACT_ID`
- `NEXT_PUBLIC_PAYOUT_VAULT_CONTRACT_ID`

See `.env.example` for the local template.

## Useful Scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm run test
npm run build
npm run db:generate
npm run db:push
npm run db:migrate
npm run db:seed
```

## API Surface

Core internal endpoints:

- `GET /api/health`
- `GET /api/events`
- `GET /api/batches`
- `POST /api/batches`
- `GET /api/batches/[id]`
- `POST /api/batches/[id]/lots`
- `POST /api/batches/[id]/quality`
- `POST /api/batches/[id]/fund`
- `POST /api/batches/[id]/approve`

## CI/CD and Deployment

GitHub Actions workflow:

- Installs dependencies with `npm ci`
- Runs `npm run typecheck`
- Runs `npm run lint`
- Runs `npm run test`
- Runs `npm run build`

Railway deployment notes:

- The app is deployed from the repository Dockerfile.
- Build-time env loading is deferred so Railway can build without a runtime `DATABASE_URL`.
- Runtime database access still requires `DATABASE_URL`.
- Healthcheck path is `/api/health`.

## Verification Snapshot

Most recent local verification on this codebase:

- `npm run test` -> 6 tests passing
- `npm run lint` -> passing
- `npm run typecheck` -> passing
- `npm run build` -> passing
- Standalone runtime healthcheck -> `GET /api/health` returned `status: ok`

## Design References

- [Landing concept](docs/design-concepts/landing-concept.png)
- [Dashboard concept](docs/design-concepts/dashboard-concept.png)
- [Batch detail concept](docs/design-concepts/batch-detail-concept.png)

## Current Gaps Before Final Submission

- Publish real Soroban contract addresses for registry and payout vault.
- Replace `TEST-SETTLE-TX-001` with a real on-chain transaction hash.
- Capture and commit the required screenshots.
- Record the final 1-2 minute demo video and replace the temporary placeholder link.
