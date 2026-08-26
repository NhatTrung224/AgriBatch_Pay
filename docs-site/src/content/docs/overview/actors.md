---
title: Who uses it
description: Cooperative, farmer, auditor and buyer — what each one signs and what the contract will accept from them.
---

Four parties touch a batch. Each signs a different call, and the contract decides what it accepts by comparing signatures, not by trusting a role the app assigned.

## Cooperative

The organisation assembling the harvest.

**Signs:** `create_batch`

Registers the batch with the buyer, the crop type, the season, the location, the asset code and the vault address that will handle settlement. Everything else about the batch flows from what is set here — including which vault it settles through — and none of it can be changed afterwards.

The cooperative **cannot** register lots on farmers' behalf. That is deliberate: the whole value of the lot record is that the farmer authorised it.

## Farmer

A smallholder contributing one lot to the batch.

**Signs:** `add_farmer_lot`

The signature carries a weight, a price per kilogram and a grade. The contract computes `weight × price × grade`, adds it to the batch total and increments the lot count.

This is the one place where a smallholder holds a key and uses it, and it is the point of the design. A lot on chain under a farmer's own signature is a figure they agreed to, verifiable weeks later when the payout arrives and the number looks wrong.

:::note[One farmer, many lots]
Nothing stops a farmer adding several lots to the same batch. Each is a separate call with its own weight, price and grade, and each adds to the total. Lot ids are supplied by the caller and appear in the event topic.
:::

## Auditor

The quality inspector.

**Signs:** `confirm_quality`

Requires the batch to have at least one lot, then marks it `QualityConfirmed`.

:::caution[Not verified against the batch]
The contract requires a signature but does not check *whose*. There is no auditor address stored on a batch to compare against, so any funded account can confirm quality on any batch. The event records who signed, which is evidence — but it is not enforcement. See [scope](/AgriBatch_Pay/overview/scope/#any-address-can-confirm-quality).
:::

## Buyer

The party purchasing the harvest.

**Signs:** `fund_vault`, then `approve_settlement`

`fund_vault` writes the release record with the funded amount. `approve_settlement` marks it approved — and this is the vault's one real authorisation check: the signer must match the buyer recorded on the release, or the contract panics with `buyer mismatch`.

The buyer address is also stored on the batch at creation, though the registry and the vault never compare notes. See [scope](/AgriBatch_Pay/overview/scope/#fund_vault-overwrites).

## Who can call what

| Call | Contract | Signature required from | Checked against a stored address? |
| --- | --- | --- | --- |
| `init` | both | admin | Refuses if already initialised |
| `create_batch` | registry | cooperative | No — the signer becomes the cooperative |
| `add_farmer_lot` | registry | farmer | No — the signer becomes the lot's farmer |
| `confirm_quality` | registry | auditor | **No** |
| `get_batch` | registry | — | Open read |
| `fund_vault` | vault | buyer | No — the signer becomes the release's buyer |
| `approve_settlement` | vault | buyer | **Yes** — must match the release |
| `get_release` | vault | — | Open read |

The pattern: **the first call establishes an identity, and later calls check against it.** `approve_settlement` is the only place where that second half exists today.

## Roles in the application

The database carries a `user_role` enum and every wallet interaction is recorded with the role it was performed under. That drives navigation and which actions the interface offers.

It does not drive what the contract accepts. The interface and the ledger are two separate gates, and only one of them is enforcement.

## Next

- [Connect a wallet](/AgriBatch_Pay/using/wallets/)
- [Contracts](/AgriBatch_Pay/internals/contracts/)
