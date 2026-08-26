---
title: Confirm quality
description: Marking a batch inspected — what the call proves, and the authorisation gap it does not close.
---

Quality confirmation is the gate between "lots collected" and "ready to settle".

You are the **auditor**.

## The call

`confirm_quality(batch_id, auditor)`, signed by the auditor.

The contract:

1. Refuses if `lot_count == 0` — `lots required`
2. Sets `quality_confirmed: true`
3. Moves the batch to `QualityConfirmed`
4. Emits a `quality` event keyed by batch id, carrying the auditor's address

## What this proves

**That someone signed, and who.** The auditor's address is in the event and the transaction is timestamped by its ledger. A confirmation cannot be backdated, and it cannot be attributed to someone who did not sign.

**That the batch had lots.** An empty batch cannot be marked inspected.

That is a meaningful record. It is not, however, enforcement.

## What it does not prove

:::caution[The contract does not check who the auditor is]
`confirm_quality` calls `auditor.require_auth()` — so a signature is required — but it never compares that address against anything stored on the batch. The `BatchRecord` has no auditor field.

**Any funded testnet account can confirm quality on any batch.**
:::

So the guarantee is "an identified party signed at this ledger", not "the appointed inspector approved". For an audit trail those are different claims, and only the first one holds.

Closing the gap means storing an auditor address at `create_batch` and comparing against it here — exactly the pattern `approve_settlement` already uses for the buyer, which is why the omission reads as an oversight rather than a decision.

## The ordering problem

Confirmation is not sticky. `add_farmer_lot` does not check the batch status, so a lot added afterwards raises `total_amount` and sets the status back to `LotsAdded`.

The confirmation flag `quality_confirmed` stays `true` while the status reverts — so a batch can read `LotsAdded` with `quality_confirmed: true`, describing a total that nobody inspected.

If you are operating this, confirm quality **after** every lot is in, and check `lot_count` and `total_amount` at the moment you sign against what you actually inspected.

## In the app

The action lives in `src/features/batches/components/batch-detail-workspace.tsx`, alongside funding and settlement approval. The batch status updates in PostgreSQL and a `quality` app event goes to the [event stream](/AgriBatch_Pay/using/events/).

## Next

- [Fund and approve settlement](/AgriBatch_Pay/using/settlement/)
- [What it does and does not do](/AgriBatch_Pay/overview/scope/)
