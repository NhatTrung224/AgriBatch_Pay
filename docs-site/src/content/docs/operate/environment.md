---
title: Environment
description: Every variable AgriBatch Pay reads, and the build-time trap that catches most Next.js deployments.
---

## The variables

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | **yes** | PostgreSQL. Neon needs `sslmode=require` |
| `NEXT_PUBLIC_STELLAR_NETWORK` | yes | `testnet` |
| `NEXT_PUBLIC_STELLAR_RPC_URL` | yes | Soroban RPC — `https://soroban-testnet.stellar.org` |
| `NEXT_PUBLIC_HORIZON_URL` | yes | `https://horizon-testnet.stellar.org` |
| `NEXT_PUBLIC_REGISTRY_CONTRACT_ID` | yes | The batch registry deployment |
| `NEXT_PUBLIC_PAYOUT_VAULT_CONTRACT_ID` | yes | The payout vault deployment |
| `NEXT_PUBLIC_EXPLORER_BASE_URL` | yes | Base for explorer links — `https://stellar.expert/explorer/testnet` |
| `PORT` | no | Defaults to `3000`; the Docker image sets it |
| `NODE_ENV` | no | Set by the tooling |

That is the complete list, and it is worth noting what is **not** in it: no Stellar secret key. The server signs nothing, so it needs no key — every transaction is signed by the user's wallet extension.

If a deployment guide ever tells you to put a Stellar secret in an environment variable for this service, it is wrong.

## The build-time trap

:::danger[`NEXT_PUBLIC_` values are frozen at build]
Every variable above with the `NEXT_PUBLIC_` prefix is **inlined into the browser bundle when `next build` runs**. Changing one on a running server does nothing.

In this project that is seven of the nine variables — including both contract ids and the network. A deployment that sets them after the build talks to whatever the build baked in, which is usually the defaults.

Set them **before** the build step in any pipeline.
:::

The consequence here is specific and bad: a wrong `NEXT_PUBLIC_REGISTRY_CONTRACT_ID` does not produce an error at startup. It produces an app that reads and writes a different contract — or a nonexistent one — and fails at the user's wallet.

## `.env.local`, not `.env`

The database and submission scripts load it explicitly:

```json
"db:migrate": "tsx --env-file=.env.local scripts/db/migrate.ts",
"db:seed":    "tsx --env-file=.env.local scripts/db/seed.ts"
```

So the filename is `.env.local`. A correct `.env` will be ignored by these scripts and they will fail with a missing `DATABASE_URL`.

Next.js itself reads `.env.local` too, so one file serves both.

## Changing network or contracts

To point at different deployments:

1. Update the contract ids and, if the network changed, the RPC, Horizon, network and explorer values **together**
2. **Rebuild** — they are `NEXT_PUBLIC_`
3. Redeploy

Mismatched network values produce a signature for one chain submitted to another, which fails *after* the user has approved. Change them as a set.

## Verifying a running instance

```bash
curl https://your-deployment.example/api/health/live   # process alive
curl https://your-deployment.example/api/health        # database reachable
```

Then open the app and confirm the contract ids in the interface match what you intended, since nothing at startup checks them.

## Next

- [Database migrations](/AgriBatch_Pay/operate/database/)
- [Deploying](/AgriBatch_Pay/operate/deploy/)
