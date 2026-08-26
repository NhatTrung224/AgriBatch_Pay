---
title: Deploying
description: Docker on Railway — the build, the health check choice, and the step the container does not do for you.
---

AgriBatch Pay deploys as a single container. The live deployment runs on Railway at [agribatchpay-production.up.railway.app](https://agribatchpay-production.up.railway.app/).

## How it builds

`railway.json` selects the Dockerfile builder:

```json
{
  "build": { "builder": "DOCKERFILE" },
  "deploy": {
    "healthcheckPath": "/api/health/live",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

The Dockerfile is a three-stage build on `node:22-alpine`:

| Stage | Does |
| --- | --- |
| `deps` | `npm ci` from `package.json` and `package-lock.json` alone, so the layer caches until dependencies change |
| `builder` | Copies the source and runs `npm run build` |
| `runner` | `NODE_ENV=production`, `HOSTNAME=0.0.0.0`, `PORT=3000`, and a non-root `nextjs` user |

`HOSTNAME=0.0.0.0` matters — a Next server bound to localhost inside a container is unreachable from outside it.

## Set the environment before the build

Every `NEXT_PUBLIC_` variable is inlined during `npm run build`, which happens **inside the image**. They have to be available to the build, not just to the running container.

Seven of the nine variables are `NEXT_PUBLIC_`, including both contract ids. Get this wrong and the deployment talks to whatever the build baked in. Full list: [environment](/AgriBatch_Pay/operate/environment/).

## The health check choice

The platform check points at **`/api/health/live`** — the endpoint that always answers 200 and never touches the database.

That is deliberate. There are two endpoints:

| Route | Question | On database failure |
| --- | --- | --- |
| `/api/health/live` | Is the process alive? | Still 200 |
| `/api/health` | Can it serve? | **503** |

Pointing the restart policy at `/api/health` would restart the container whenever Postgres hiccups — which does not fix Postgres, and turns a brief database problem into a restart loop with three retries and then a dead service.

So: **liveness for the platform, readiness for you.** Monitor `/api/health` yourself; let the platform watch `/api/health/live`.

More on the split in [health checks](/AgriBatch_Pay/operate/health/).

## Migrations are not automatic

Nothing in `railway.json` or the Dockerfile runs a migration. There is no pre-deploy command.

Run them yourself against the production database **before** deploying a build that needs a schema change:

```bash
npm run db:migrate
```

A deploy that assumes this happened will start cleanly and fail at the first query — which the health check will notice, but only at `/api/health`, not at the liveness endpoint the platform is watching.

## After deploying

```bash
curl https://your-deployment.example/api/health/live
curl https://your-deployment.example/api/health
```

The second should report `"database": "ok"` with a latency. Then open the app and confirm the contract ids match what you intended — nothing validates them at startup.

## Deploying contracts

The contracts are already on testnet and do not need redeploying to run the app.

For your own:

```bash
cargo build --manifest-path contracts/Cargo.toml --target wasm32-unknown-unknown --release
# deploy each with the Stellar CLI, then call init(admin) once per contract
```

Update `NEXT_PUBLIC_REGISTRY_CONTRACT_ID` and `NEXT_PUBLIC_PAYOUT_VAULT_CONTRACT_ID`, and rebuild.

:::caution[Batches do not migrate]
Existing batches and releases stay in the old deployments. Nothing copies them, and the app talks only to the ids it was built with — so a contract redeploy makes prior settlements invisible to the product, though they remain readable on chain.
:::

## CI

`.github/workflows/ci.yml` runs a `contracts` job (clippy, tests, Wasm build) and a `validate` job (Node 24, `npm ci`, typecheck, lint, tests, build). See [tests and CI](/AgriBatch_Pay/operate/testing/).

## Next

- [Health checks](/AgriBatch_Pay/operate/health/)
- [Tests and CI](/AgriBatch_Pay/operate/testing/)
