---
title: Database schema
description: Five Drizzle tables in Neon PostgreSQL — what each holds, why each index exists, and what the database knows that the chain does not.
---

Five tables, defined in `src/lib/db/schema.ts` with Drizzle. None of them is authoritative over the chain; all of them make the product usable.

## `batches`

The readable mirror of a registry batch.

| Column | Notes |
| --- | --- |
| `id` | Primary key — the same batch id used on chain |
| `buyer_wallet`, `cooperative_wallet` | The two parties |
| `crop_type`, `season`, `location` | Descriptive |
| `asset_code`, `asset_contract_address` | Settlement asset |
| `registry_contract_address`, `vault_contract_address` | Which deployments this batch belongs to |
| `status` | `batch_status` enum, mirroring the contract |
| `farmer_count`, `total_amount` | Denormalised for listing |
| `expected_payout_date` | Application-only |
| `last_tx_hash` | Most recent related transaction |
| `created_at`, `updated_at` | Timestamps |

**Index:** `batches_updated_at_idx` on `updated_at` — the directory orders by it on every page load.

:::note[`total_amount` is `doublePrecision`]
The chain stores `i128`. The mirror stores a float, which is fine for display and wrong for anything you would settle against. When the two disagree, `get_batch` is the authority — see [architecture](/AgriBatch_Pay/internals/architecture/#everything-is-written-twice).
:::

## `farmer_lots`

One row per lot, and the table that carries what the chain deliberately does not.

| Column | Notes |
| --- | --- |
| `id` | Primary key |
| `batch_id` | FK to `batches`, **cascade delete** |
| `farmer_name` | Off chain — a name is personal data |
| `farmer_wallet` | The address that signed the lot |
| `weight_kg`, `price_per_kg`, `grade` | The inputs |
| `payout_amount` | The computed share |
| `paid`, `payout_tx_hash` | **Application-only** — no contract method sets these |

**Index:** `farmer_lots_batch_id_idx` — every batch read and every payout recalculation filters on it.

`paid` is worth flagging: "has this farmer been paid" is a claim the database makes, not one the chain backs. The contracts do not move money, so nothing on chain corresponds to it.

## `wallet_interactions`

Every connect, signature and submission — **including failures**.

| Column | Notes |
| --- | --- |
| `provider` | Freighter or Rabet |
| `role` | The role it was performed under |
| `action`, `contract_address`, `tx_hash` | What was attempted |
| `public_key` | Who attempted it |
| `success` | Defaults to `false` |
| `error_message` | Populated when it failed |

**Index:** `wallet_interactions_created_at_idx` — the live stream polls "newer than" every three seconds, per open connection.

Recording failures is deliberate. A proof surface counting only successes would overstate the product and hide the problems worth fixing.

## `app_events`

The feed behind `/api/events`.

| Column | Notes |
| --- | --- |
| `type` | `app_event_type` enum |
| `message` | Human-readable |
| `batch_id` | FK, **set null** on delete — an event survives its batch |
| `tx_hash` | When the event corresponds to a transaction |
| `metadata` | `jsonb`, typed as a flat record |

**Indexes:** `created_at` for the stream poll, `batch_id` for per-batch history.

The cascade choice differs from `farmer_lots` on purpose: deleting a batch should not erase the record that it existed.

## `submission_evidence`

A single row tracking reviewer-facing evidence: repository URL, CI status, live demo status, healthcheck status, Railway status, README status, demo video status, mobile screenshot status, both contract addresses, a contract interaction transaction hash, a test output summary, and a JSON screenshot checklist.

It backs the `/submission` page. It is metadata about the project, not about a settlement.

## Enums

Four, defined from TypeScript constants in `src/types/domain` so the database and the application cannot drift apart:

`batch_status`, `user_role`, `wallet_provider`, `app_event_type`.

## Types

Drizzle infers them:

```ts
export type BatchInsert = typeof batches.$inferInsert;
export type BatchSelect = typeof batches.$inferSelect;
```

No hand-written row interface to fall out of date.

## What the database knows that the chain does not

- Farmer names
- Whether a farmer has actually been paid
- Failed wallet interactions
- The event feed
- Submission evidence

And the chain knows one thing the database cannot: **that nobody edited it**.

## Next

- [HTTP API](/AgriBatch_Pay/internals/api/)
- [Database migrations](/AgriBatch_Pay/operate/database/)
