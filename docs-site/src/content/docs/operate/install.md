---
title: Install and run
description: Getting AgriBatch Pay running locally against Stellar testnet.
---

## Requirements

| | Version | Needed for |
| --- | --- | --- |
| Node.js | 22 or newer | The app. CI uses 24, the Docker image uses 22 |
| npm | ships with Node | This repo uses `package-lock.json` |
| PostgreSQL | any recent | Neon in production; local works |
| Rust + `wasm32-unknown-unknown` | stable | **Only** to change the contracts |
| Stellar CLI | latest | **Only** to deploy contracts |

Both contracts are already on testnet, so you can run the product without Rust.

## Clone and install

```bash
git clone https://github.com/NhatTrung224/AgriBatch_Pay.git
cd AgriBatch_Pay
npm install
```

## Environment

Create `.env.local`:

```ini
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_STELLAR_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org
NEXT_PUBLIC_REGISTRY_CONTRACT_ID=CDU5E62JV6TZCUXX3JNPPKPJOVUB4X4KZP5UFDJSJO6ULFPETOKFYPD7
NEXT_PUBLIC_PAYOUT_VAULT_CONTRACT_ID=CDHX4QBID4ILQMMYEUDPBADQOLN6QZKAPA3YDDWDZR2B5BUZBSWFS5EH
NEXT_PUBLIC_EXPLORER_BASE_URL=https://stellar.expert/explorer/testnet
PORT=3000
```

The `db:*` and `submission:*` scripts read `.env.local` explicitly via `tsx --env-file=.env.local`, so that filename matters. Details in [environment](/AgriBatch_Pay/operate/environment/).

## Database

```bash
npm run db:generate   # generate migrations from the schema
npm run db:migrate    # apply them
npm run db:seed       # demo data
```

See [database migrations](/AgriBatch_Pay/operate/database/).

## Run

```bash
npm run dev
```

Open `http://localhost:3000`, connect Freighter or Rabet on **testnet**, and fund the account from [friendbot](https://friendbot.stellar.org/).

Then follow [register a batch](/AgriBatch_Pay/using/register-a-batch/).

## Production build

```bash
npm run build
npm start
```

## Contract work

```bash
cargo test   --manifest-path contracts/Cargo.toml
cargo clippy --manifest-path contracts/Cargo.toml
cargo build  --manifest-path contracts/Cargo.toml --target wasm32-unknown-unknown --release
```

Deploy with the Stellar CLI, then update `NEXT_PUBLIC_REGISTRY_CONTRACT_ID` and `NEXT_PUBLIC_PAYOUT_VAULT_CONTRACT_ID` — and **rebuild**, because `NEXT_PUBLIC_` values are inlined at build time.

## Troubleshooting

| Symptom | Cause |
| --- | --- |
| `/api/health` returns 503 | The database is unreachable. `/api/health/live` still answers 200 — that is the design, see [health checks](/AgriBatch_Pay/operate/health/). |
| Wallet will not connect | Extension locked, or not on testnet. |
| A transaction fails at once | No testnet XLM. Use friendbot. |
| Simulation fails before signing | Usually a bad argument or a missing account. `prepareTransaction` catches it before the user is asked to sign. |
| Nothing happens for ~12 seconds, then no receipt | The invocation helper stopped polling. The transaction may still land — check the explorer before retrying. |
| `batch exists` | That batch id is taken. |

## Next

- [Environment](/AgriBatch_Pay/operate/environment/)
- [Deploying](/AgriBatch_Pay/operate/deploy/)
