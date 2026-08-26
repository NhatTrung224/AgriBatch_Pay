---
title: Fund and approve settlement
description: The buyer's two calls on the payout vault — what each records, and what neither one moves.
---

Settlement is two signatures from the buyer, on the **payout vault** rather than the registry.

:::caution[These calls record, they do not transfer]
Neither `fund_vault` nor `approve_settlement` moves a token. There is no transfer in the vault contract at all. Both write attestations: the buyer states they funded, and the buyer states they approve.

Money reaches farmers off-platform. What the chain carries is a signed, timestamped record of what was agreed. See [what it does and does not do](/AgriBatch_Pay/overview/scope/).
:::

## Step 1 — Fund the vault

`fund_vault(batch_id, buyer, registry_contract, amount)`, signed by the **buyer**.

It writes a `VaultRelease`:

| Field | Value |
| --- | --- |
| `batch_id` | The batch being settled |
| `buyer` | The signer |
| `registry_contract` | The registry address this batch lives on |
| `funded_amount` | The amount stated |
| `approved` | `false` |
| `last_actor` | The signer |
| `status` | `Funded` |

Emits a `fund` event with the buyer and the amount.

### What it does not check

- **Not against the batch total.** The vault never reads the registry. `funded_amount` is whatever the buyer passes; the contract will happily record an amount that has nothing to do with `total_amount`.
- **Not against quality.** A batch that was never confirmed can be funded.
- **Not against an existing release.** Calling `fund_vault` twice **overwrites** the first record — including resetting `approved` back to `false`.

That last one is worth pausing on: a second funding call silently undoes an approval. If you are operating this, treat `fund_vault` as write-once by convention, because the contract does not enforce it.

## Step 2 — Approve settlement

`approve_settlement(batch_id, buyer)`, signed by the **buyer**.

The contract reads the release and **refuses unless the signer matches the recorded buyer** — `buyer mismatch`. This is the vault's one genuine authorisation check, and it is the strongest guarantee on this page.

Then it sets `approved: true`, updates `last_actor` and moves the status to `SettlementApproved`.

Emits an `approve` event with the buyer.

## Checking a settlement afterwards

`get_release(batch_id)` is an open read — no signature, no permission. Anyone can ask the vault what it holds for a batch and get back the buyer, the funded amount, the approval flag and the status.

Pair it with `get_batch(batch_id)` on the registry, and a third party can compare what the buyer funded against what the lots actually totalled. **The contracts will not do that comparison for you** — but the two reads are public, so anyone can do it themselves.

That comparison is, in practice, the real audit: if `funded_amount` and `total_amount` disagree, somebody has some explaining to do, and both figures are on a public ledger.

## In the app

Both actions are in `src/features/batches/components/batch-detail-workspace.tsx`, and both mirror into PostgreSQL — the batch status, the release state and an app event for the [live stream](/AgriBatch_Pay/using/events/).

Per-farmer payout tracking (`paid`, `payout_tx_hash` on `farmer_lots`) is entirely application-side. No contract method sets it.

## Next

- [Watch the event stream](/AgriBatch_Pay/using/events/)
- [Contracts](/AgriBatch_Pay/internals/contracts/)
