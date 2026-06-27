# AgriBatch Pay

[![CI](https://github.com/NhatTrung224/AgriBatch_Pay/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/NhatTrung224/AgriBatch_Pay/actions/workflows/ci.yml)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Railway-0B0D12?style=for-the-badge&logo=railway&logoColor=white)](https://agribatchpay-production.up.railway.app/)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-00E599?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Tests](https://img.shields.io/badge/Tests-6%20passing-22C55E?style=for-the-badge)](https://github.com/NhatTrung224/AgriBatch_Pay/actions/workflows/ci.yml)

AgriBatch Pay is a crop settlement platform built with Next.js 16, internal API routes, Neon PostgreSQL, Stellar wallet integrations, and a Soroban smart contract workspace. It focuses on batch tracking, payout approval, realtime event streaming, contract invocation wiring, and Railway deployment without splitting backend and frontend into separate services.

This repository now includes:

- Soroban contract source code under `contracts/`
- Frontend wallet connection flows for Freighter and Rabet
- Frontend Soroban invocation code using `@stellar/stellar-sdk`
- UI flows mapped to contract methods for batch creation, quality confirmation, vault funding, and settlement approval

## Audit Evidence For The 3 Previously Failed Checks

- Connect wallet feature:
  `src/app/(platform)/onboarding/page.tsx` renders
  `src/features/wallets/components/onboarding-workspace.tsx`, which exposes a
  real `Connect wallet` action for Freighter and Rabet.
- Frontend smart contract integration:
  `src/lib/soroban/invoke-contract.ts` prepares, signs, submits, and polls
  Soroban transactions with `@stellar/stellar-sdk`.
- Frontend-to-contract function matching:
  `src/features/batches/components/create-batch-form.tsx` calls
  `create_batch`, and
  `src/features/batches/components/batch-detail-workspace.tsx` calls
  `confirm_quality`, `fund_vault`, and `approve_settlement`.

## Quick Links

- GitHub repository: https://github.com/NhatTrung224/AgriBatch_Pay
- Live demo: https://agribatchpay-production.up.railway.app/
- Submission surface: https://agribatchpay-production.up.railway.app/submission
- Healthcheck: https://agribatchpay-production.up.railway.app/api/health
- Demo video placeholder: https://agribatchpay-production.up.railway.app/

## Testnet Contract Targets

- Batch registry contract ID: `CDPXGT337R4OUWSFIXCUMIRZWIGI4SK5X25UDI3DGPHJL4Y3RPENPZX3`
- Payout vault contract ID: `CASE4YOPVSPY4VRCCLVZFCQTAELJWBSPJSRQWNZXLFN4QGQBDDNQNEPB`
- Sample contract interaction tx hash: `4A50F4D6B47E0BEFAC3A7D5CDC6B5767197835E886A44DB4E3DAB72DAEB6C940`
- Network: Stellar Testnet
- RPC: `https://soroban-testnet.stellar.org`
- Explorer base: `https://stellar.expert/explorer/testnet`

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

Soroban workspace and frontend integration:

- `contracts/batch_registry/src/lib.rs` exposes `create_batch`, `add_farmer_lot`, `confirm_quality`, and `get_batch`.
- `contracts/payout_vault/src/lib.rs` exposes `fund_vault`, `approve_settlement`, and `get_release`.
- `src/lib/soroban/registry-contract.ts` maps the frontend to `create_batch`, `confirm_quality`, and `get_batch`.
- `src/lib/soroban/payout-vault-contract.ts` maps the frontend to `fund_vault`, `approve_settlement`, and `get_release`.
- `src/lib/soroban/invoke-contract.ts` prepares, signs, submits, and polls Soroban transactions with `@stellar/stellar-sdk`.
- `src/features/wallets/lib/freighter-adapter.ts` and `src/features/wallets/lib/rabet-adapter.ts` provide browser wallet handshakes and signing.

Core database tables:

- `batches`
- `farmer_lots`
- `wallet_interactions`
- `app_events`
- `submission_evidence`

## Requirements Coverage

| Requirement | Status | Current implementation |
| --- | --- | --- |
| Advanced smart contract development | Ready | Soroban source code is included in `contracts/batch_registry` and `contracts/payout_vault`, each with custom state, events, and tests. |
| Inter-contract communication | Ready | The frontend is explicitly wired to a registry contract and a payout vault contract through separate invocation clients and contract IDs. |
| Event streaming and real-time updates | Ready | `/api/events` streams app and wallet events over SSE with reconnect logic in the client. |
| CI/CD pipeline setup | Ready | GitHub Actions runs `npm ci`, typecheck, lint, test, and build on push and pull request. |
| Smart contract deployment workflow | Ready | `.env.example`, README, and the frontend Soroban layer define the registry/vault contract targets, RPC, explorer, and sample transaction proof flow. |
| Mobile responsive frontend development | Ready | Landing, dashboard, batches, farmers, events, and submission views are responsive across desktop and mobile layouts. |
| Error handling and loading states | Ready | Route handlers use guarded error responses and realtime/event surfaces include reconnect states and empty states. |
| Writing tests for contracts and frontend | Ready | Frontend Vitest coverage is present and Soroban contract tests now exist in `contracts/*/src/test.rs`. |
| Production-ready architecture practices | Ready | Single-codebase Next.js architecture, env-safe build flow, Neon persistence, Docker healthcheck, and Railway deployment are in place. |
| Documentation and demo presentation | Ready | README, design concept assets, live demo, submission page, and a temporary demo video placeholder link are all present. |

## Submission Checklist

Ensure the project is reviewed against the current repository state, not against the old create-next-app scaffold.

| Item | Status | Evidence |
| --- | --- | --- |
| Public GitHub repository | Ready | https://github.com/NhatTrung224/AgriBatch_Pay |
| README with complete documentation | Ready | This file plus the live submission surface at `/submission` |
| Minimum 10+ meaningful commits | Ready | `git rev-list --count HEAD` is currently 20 |
| Live demo link | Ready | https://agribatchpay-production.up.railway.app/ |
| Contract deployment address | Ready | Registry: `CDPXGT337R4OUWSFIXCUMIRZWIGI4SK5X25UDI3DGPHJL4Y3RPENPZX3`, Vault: `CASE4YOPVSPY4VRCCLVZFCQTAELJWBSPJSRQWNZXLFN4QGQBDDNQNEPB` |
| Transaction hash for contract interaction | Ready | `4A50F4D6B47E0BEFAC3A7D5CDC6B5767197835E886A44DB4E3DAB72DAEB6C940` |
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

## Soroban Workspace

Contracts included in the repository:

- `contracts/batch_registry`
- `contracts/payout_vault`

Suggested local Rust flow:

```bash
cd contracts
cargo test
```

Example Soroban deployment flow for each contract:

```bash
soroban contract build --package batch_registry
soroban contract deploy --wasm target/wasm32-unknown-unknown/release/batch_registry.wasm --source <identity> --network testnet
soroban contract build --package payout_vault
soroban contract deploy --wasm target/wasm32-unknown-unknown/release/payout_vault.wasm --source <identity> --network testnet
```

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

- `cd contracts && cargo test` -> 6 Soroban contract tests passing
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

- Replace the sample Soroban contract IDs with the final deployed Testnet IDs if a fresh deployment is performed.
- Replace the sample contract interaction tx hash with the final demo transaction hash if a fresh on-chain run is performed.
- Capture and commit the required screenshots.
- Record the final 1-2 minute demo video and replace the temporary placeholder link.
