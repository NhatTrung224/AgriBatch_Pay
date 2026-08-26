---
title: What it does and does not do
description: The honest boundary — what the contracts guarantee, what they only record, and what is not implemented at all.
---

Every project's documentation is more useful for what it admits than for what it claims. This page is the admissions.

## The one that matters most

**The contracts record. They do not hold money.**

There is no `token::Client` in either `batch_registry` or `payout_vault`. Neither contract calls `transfer`. Searching both source files for a token operation returns nothing, and that is not an oversight in the docs — it is the actual design.

So:

| What people assume | What is true |
| --- | --- |
| `fund_vault` moves the buyer's money into escrow | It writes a record saying the buyer states they funded `amount` |
| `approve_settlement` releases funds to farmers | It flips `approved` to true and records who did it |
| A farmer is paid by the contract | A farmer is paid off-platform; the contract records what they were owed |

What you get is a **tamper-evident audit trail** of a settlement: who registered what, what the arithmetic came to, who confirmed quality, and who approved. What you do not get is custody.

That is a real product — the [disputes in this market](/AgriBatch_Pay/overview/problem/) are about the record, not about custody — but it is a different product from an escrow, and building on it as though it were an escrow would be a mistake.

## What the contracts genuinely guarantee

These hold, and they are worth something:

**A lot is authorised by its farmer.** `add_farmer_lot` calls `farmer.require_auth()`. The cooperative cannot register a weight and price in a farmer's name.

**The total is computed on chain.** The app does not send a total to be stored. `total_amount` is the accumulated sum of `weight × price × grade` across every lot the contract accepted.

**A batch id is unique.** `create_batch` refuses an id that already exists, so a batch cannot be quietly replaced.

**Quality needs lots.** `confirm_quality` refuses a batch with `lot_count == 0`.

**Approval requires the recorded buyer.** `approve_settlement` compares the signer against the buyer stored on the release and panics on a mismatch.

**Every step emits an event.** `create`, `lot`, `quality`, `fund`, `approve` — with the ledger timestamp that comes free with a transaction.

## Known limitations

Stated plainly, because a reader who finds these on their own trusts nothing else on the site.

### Any address can confirm quality

`confirm_quality(batch_id, auditor)` calls `auditor.require_auth()` but never compares `auditor` against an address stored on the batch. The batch record has no auditor field at all.

So the call proves someone signed and the event names them, but the contract does not enforce that they were the appointed inspector. Anyone with a funded testnet account can confirm quality on any batch.

Fixing it means storing an auditor on the batch at creation and comparing — the same pattern `approve_settlement` already uses for the buyer.

### `fund_vault` overwrites

`fund_vault` writes a fresh `VaultRelease` without checking whether one already exists for that batch. Calling it twice replaces the first record, including resetting `approved` to false.

There is also no check that the funded amount matches the batch's `total_amount`, and no check that the batch reached `QualityConfirmed`. The registry and the vault do not read each other — the vault stores a `registry_contract` address but never calls it.

### Lots can be added after quality confirmation

`add_farmer_lot` does not check the batch status. A lot added after `confirm_quality` increases `total_amount` and moves the status back to `LotsAdded`, silently invalidating a confirmation that has already happened.

### The admin does nothing

Both contracts have `init(admin)` storing an admin address, and neither uses it afterwards. No method checks it. It is a placeholder for governance that does not exist yet.

The upside of an unused admin key is that compromising it grants nothing.

### Grade is an unbounded multiplier

`payout = weight × price × grade`, with grade taken as given and no ceiling. A grade of 100 pays a hundred times. Whether that is the intended pricing model is a business question; the contract does not constrain it.

## Not implemented

| | Status |
| --- | --- |
| Token custody or transfer | Absent by design, as above |
| Dispute or correction flow | No method amends or removes a lot once added |
| Farmer payout execution | Tracked in the database (`paid`, `payout_tx_hash`), not performed by a contract |
| Mainnet | Testnet only |
| Registry ↔ vault verification | The vault stores the registry address but never reads from it |

## Reading this fairly

The contracts are small, and every guarantee above is one you can check by reading about 160 lines of Rust across the two files. The limitations are the cost of that smallness.

If you are evaluating this: treat the on-chain layer as a **signed, timestamped, publicly readable log of a settlement's arithmetic**, and treat the authorisation model as complete for farmers and buyers, incomplete for auditors.

## Next

- [Contracts](/AgriBatch_Pay/internals/contracts/) — the method-by-method detail
- [Testnet evidence](/AgriBatch_Pay/evidence/testnet/) — what is actually deployed
