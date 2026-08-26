# AgriBatch Pay

[![CI](https://github.com/NhatTrung224/AgriBatch_Pay/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/NhatTrung224/AgriBatch_Pay/actions/workflows/ci.yml)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Railway-0B0D12?style=for-the-badge&logo=railway&logoColor=white)](https://agribatchpay-production.up.railway.app/)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-00E599?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Tests](https://img.shields.io/badge/Tests-verified%20in%20CI-22C55E?style=for-the-badge)](https://github.com/NhatTrung224/AgriBatch_Pay/actions/workflows/ci.yml)
[![Docs](https://img.shields.io/badge/Documentation-website-1F9D55?style=for-the-badge&logo=readthedocs&logoColor=white)](https://nhattrung224.github.io/AgriBatch_Pay/)

> ## 📗 Documentation website
>
> ### **https://nhattrung224.github.io/AgriBatch_Pay/**
>
> The full documentation — what the platform does, how to use it, how to run it and how it is built — with search and rendered diagrams.
>
> | | |
> | --- | --- |
> | New here | [The settlement problem](https://nhattrung224.github.io/AgriBatch_Pay/overview/problem/) → [How it works](https://nhattrung224.github.io/AgriBatch_Pay/overview/how-it-works/) |
> | **Before building on it** | [What it does and does not do](https://nhattrung224.github.io/AgriBatch_Pay/overview/scope/) — the contracts record, they do not hold funds |
> | Using it | [Register a batch](https://nhattrung224.github.io/AgriBatch_Pay/using/register-a-batch/) · [Add farmer lots](https://nhattrung224.github.io/AgriBatch_Pay/using/farmer-lots/) · [Settlement](https://nhattrung224.github.io/AgriBatch_Pay/using/settlement/) |
> | Running it | [Install](https://nhattrung224.github.io/AgriBatch_Pay/operate/install/) · [Environment](https://nhattrung224.github.io/AgriBatch_Pay/operate/environment/) · [Deploying](https://nhattrung224.github.io/AgriBatch_Pay/operate/deploy/) |
> | Internals | [Architecture](https://nhattrung224.github.io/AgriBatch_Pay/internals/architecture/) · [Contracts](https://nhattrung224.github.io/AgriBatch_Pay/internals/contracts/) · [HTTP API](https://nhattrung224.github.io/AgriBatch_Pay/internals/api/) |
> | Verifying it | [Testnet evidence](https://nhattrung224.github.io/AgriBatch_Pay/evidence/testnet/) |

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
- Documentation website: https://nhattrung224.github.io/AgriBatch_Pay/
- Live demo: https://agribatchpay-production.up.railway.app/
- Submission surface: https://agribatchpay-production.up.railway.app/submission
- Pitch deck: https://agribatchpay-production.up.railway.app/submission/pitch-deck.html
- Demo video: https://raw.githubusercontent.com/NhatTrung224/AgriBatch_Pay/main/public/submission/level5-demo.mp4
- User feedback audit: `npm run feedback:audit`
- Demo walkthrough script: https://agribatchpay-production.up.railway.app/submission/demo-video-script.html
- Healthcheck: https://agribatchpay-production.up.railway.app/api/health/live

## Testnet Contract Targets

- Batch registry contract ID: `CDU5E62JV6TZCUXX3JNPPKPJOVUB4X4KZP5UFDJSJO6ULFPETOKFYPD7`
- Payout vault contract ID: `CDHX4QBID4ILQMMYEUDPBADQOLN6QZKAPA3YDDWDZR2B5BUZBSWFS5EH`
- Verified settlement approval: [5a904f21…bc4f](https://stellar.expert/explorer/testnet/tx/5a904f2166d5cce3548ba6ce74f98e0728b4ba17c04c1e175097a7e0548abc4f)
- Deployment and QA evidence: [Testnet contract record](docs/testnet-contract-deployment.md)
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
| Runtime health | `/api/health` (database readiness) + `/api/health/live` (deployment liveness) |

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
| Documentation and demo presentation | Ready | README, design concept assets, live demo, submission page, pitch deck, demo video, and recording script are present. |

## Submission Checklist

Ensure the project is reviewed against the current repository state, not against the old create-next-app scaffold.

| Item | Status | Evidence |
| --- | --- | --- |
| Public GitHub repository | Ready | https://github.com/NhatTrung224/AgriBatch_Pay |
| README with complete documentation | Ready | This file plus the live submission surface at `/submission` |
| Minimum 20+ meaningful commits | Ready | 42+ commits on main |
| Live demo link | Ready | https://agribatchpay-production.up.railway.app/ |
| PPT / pitch deck link | Ready | https://agribatchpay-production.up.railway.app/submission/pitch-deck.html |
| Contract deployment address | Ready | [Registry](https://stellar.expert/explorer/testnet/contract/CDU5E62JV6TZCUXX3JNPPKPJOVUB4X4KZP5UFDJSJO6ULFPETOKFYPD7) · [Vault](https://stellar.expert/explorer/testnet/contract/CDHX4QBID4ILQMMYEUDPBADQOLN6QZKAPA3YDDWDZR2B5BUZBSWFS5EH) |
| Transaction hash for contract interaction | Ready | [Settlement approval](https://stellar.expert/explorer/testnet/tx/5a904f2166d5cce3548ba6ce74f98e0728b4ba17c04c1e175097a7e0548abc4f) |
| Testnet account activity | Ready | [On-chain QA run](docs/testnet-contract-deployment.md) covers the currently configured contract pair. |
| User feedback responses | Ready | 32 responses, each mapped to an interacted wallet in the linked Google Sheet. |
| Analytics and transaction activity | Ready | [Activity proof](docs/level5-transaction-activity-proof.md) and [dashboard screenshot](docs/screenshots/dashboard-analytics.png). |
| Screenshot showing mobile responsive UI | Ready | [Submission proof screenshot](docs/screenshots/submission-proof.png) |
| Screenshot showing CI/CD pipeline running | Ready | [GitHub Actions CI](docs/screenshots/github-actions-ci.png) |
| Screenshot showing analytics or transaction activity | Ready | [Dashboard analytics](docs/screenshots/dashboard-analytics.png), [events activity](docs/screenshots/events-activity.png) |
| Screenshot showing test output with 3+ passing tests | Ready | [Submission proof screenshot](docs/screenshots/submission-proof.png) plus current local verification: 7 passing Vitest tests |
| Demo video link (1-2 minutes) | Ready | [Watch the MP4](https://raw.githubusercontent.com/NhatTrung224/AgriBatch_Pay/main/public/submission/level5-demo.mp4) or open the [repo copy](public/submission/level5-demo.mp4). |
| User feedback iteration summary | Ready | See [User Feedback Iteration Summary](docs/user-feedback-iteration-summary.md) and [Level 5 Feedback Log](docs/level5-feedback-log.md). |
| Google Form question set | Ready | [Form template](docs/user-feedback-form.md) |
| Google Sheet response export | Ready | [Open native Google Sheet](https://docs.google.com/spreadsheets/d/1WhVA-DKNeuGxVVm0M2L60MiquRMnWHJW0LvfjyFrWpE/edit?usp=drivesdk) |

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
stellar contract deploy --wasm target/wasm32-unknown-unknown/release/batch_registry.wasm --source-account <identity> --network testnet
stellar contract deploy --wasm target/wasm32-unknown-unknown/release/payout_vault.wasm --source-account <identity> --network testnet
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
npm run submission:audit-proof
```

## API Surface

Core internal endpoints:

- `GET /api/health`
- `GET /api/health/live`
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
- Railway healthcheck path is `/api/health/live`; `/api/health` remains the database readiness endpoint.

## Verification Snapshot

Most recent local verification on this codebase:

- On-chain QA evidence -> current registry and vault IDs plus verified lifecycle links in [Testnet contract record](docs/testnet-contract-deployment.md)
- Screenshot evidence -> `docs/screenshots/dashboard-analytics.png`, `docs/screenshots/events-activity.png`, `docs/screenshots/submission-proof.png`
- `npm run submission:audit-proof` -> prints distinct wallets, wallet interactions, tx hashes, and event proof counts
- `cd contracts && cargo test` -> 6 Soroban contract tests passing
- `npm run test` -> 6 tests passing
- `npm run lint` -> passing
- `npm run typecheck` -> passing
- `npm run build` -> passing
- Standalone deployment healthcheck -> `GET /api/health/live` returns `status: ok`

## Design References

- [Landing concept](docs/design-concepts/landing-concept.png)
- [Dashboard concept](docs/design-concepts/dashboard-concept.png)
- [Batch detail concept](docs/design-concepts/batch-detail-concept.png)

## Revision Notes

- Public proof wording now uses user wallet evidence, not local account generation labels.
- Required screenshots are committed under `docs/screenshots/`.
- Demo video is included at `public/submission/level5-demo.mp4`; the walkthrough script remains linked as supporting material.
