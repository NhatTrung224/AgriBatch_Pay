---
title: Add farmer lots
description: The step where each grower signs for their own weight, price and grade — and the contract does the arithmetic.
---

This is the step the whole platform exists for. Each farmer signs for their own lot, and the contract totals them.

You are the **farmer**.

## What a lot records

`add_farmer_lot` is signed by the farmer and carries:

| Field | Notes |
| --- | --- |
| `batch_id` | The batch this lot joins |
| `lot_id` | An identifier for this lot; appears in the event topic |
| `farmer` | The signer |
| `weight_kg` | Delivered weight |
| `price_per_kg` | Agreed price |
| `grade` | Quality grade — a **multiplier**, see below |

## The arithmetic

The contract computes it. The application does not send a total to be stored:

```
payout = weight_kg × price_per_kg × grade
```

with `grade == 0` treated as `1`, so a missing grade never zeroes a farmer's payout.

Then:

- `batch.total_amount += payout`
- `batch.lot_count += 1`
- `batch.status = LotsAdded`

:::caution[Grade multiplies the whole payout]
A grade of 3 pays three times a grade of 1. Not a small premium — triple. It is the single most consequential number in a lot, and there is no upper bound on it in the contract.

If you are a farmer, check the grade before you sign. If you are evaluating the design, note that a straight unbounded multiplier is a choice, and [scope](/AgriBatch_Pay/overview/scope/#grade-is-an-unbounded-multiplier) treats it as a limitation.
:::

## Why the farmer signs

The cooperative cannot add a lot on a farmer's behalf. `farmer.require_auth()` means the signature has to come from the farmer's own key.

That is what makes the record worth having. Weeks later, when a payout lands and the number looks wrong, the lot on chain is one the farmer themselves authorised — weight, price and grade — and the batch total was computed from it along with every other lot. Neither figure is the cooperative's to revise.

## Several lots per farmer

Nothing prevents it. Each call is a separate lot with its own weight, price and grade, and each adds to the total.

## What the contract does not check

Worth knowing before you rely on it:

- **No status check.** A lot can be added *after* `confirm_quality`. Doing so raises the total and moves the batch back to `LotsAdded`, silently invalidating a confirmation that already happened.
- **No duplicate check on `lot_id`.** The id goes into the event topic, not into a uniqueness constraint.
- **No amendment.** There is no method to correct or remove a lot. A mistake stays on the record, and the only remedy is a new batch.

All three are in [scope](/AgriBatch_Pay/overview/scope/#lots-can-be-added-after-quality-confirmation).

## In the app

Lots are added from the batch detail workspace and mirrored into the `farmer_lots` table with the farmer's name, wallet, weight, price, grade and computed payout — plus `paid` and `payout_tx_hash`, which the platform tracks and the contract does not.

Each lot emits a `lot` event keyed by batch and lot id, carrying the farmer and the payout amount. Those events drive the [live stream](/AgriBatch_Pay/using/events/).

## Next

- [Confirm quality](/AgriBatch_Pay/using/confirm-quality/)
- [Database schema](/AgriBatch_Pay/internals/schema/)
