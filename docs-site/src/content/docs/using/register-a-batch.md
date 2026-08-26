---
title: Register a batch
description: Creating the on-chain record for one crop, one season, one buyer — and the fields you cannot change afterwards.
---

A batch is one crop, one season, one buyer. Registering it creates the record every farmer lot will attach to.

You are the **cooperative**.

## Before you start

- Wallet connected on testnet, with testnet XLM — see [connect a wallet](/AgriBatch_Pay/using/wallets/)
- The **buyer's** Stellar address
- The **payout vault** contract address this batch will settle through

## What you supply

`create_batch` is signed by the cooperative and records:

| Field | Notes |
| --- | --- |
| `batch_id` | Your identifier for this harvest. **Must be unique** — the contract refuses one that exists |
| `buyer` | The purchasing party's address |
| `cooperative` | The signer. You do not supply it separately; signing makes it yours |
| `asset_code` | The settlement asset |
| `crop_type` | Coffee, cacao, pepper — whatever the batch is |
| `season` | The harvest period |
| `location` | Where the batch was assembled |
| `vault_contract` | The payout vault address that will handle funding and approval |

The batch is created at `status: Created`, with `lot_count: 0`, `total_amount: 0` and `quality_confirmed: false`.

## Doing it

The form is `src/features/batches/components/create-batch-form.tsx`. Fill it in, sign in your wallet, and the app writes the batch to PostgreSQL alongside the contract call.

The contract emits a `create` event keyed by batch id, carrying the whole record.

## What you cannot change later

Everything above. There is no `update_batch`, no method that amends a field, and no way to point a registered batch at a different vault or buyer.

:::caution[Get the vault address right]
`vault_contract` is stored on the batch, and settlement happens against whichever vault the buyer actually calls. The registry never reads the vault and the vault never reads the registry, so a wrong address here does not produce an error — it produces a batch whose recorded vault and actual settlement are two different things.

Check it against [testnet evidence](/AgriBatch_Pay/evidence/testnet/) before you sign.
:::

## What can go wrong

| Symptom | Cause |
| --- | --- |
| `batch exists` | That batch id is taken. Ids are not reusable. |
| The wallet will not sign | Extension locked, or on the wrong network. |
| The transaction fails immediately | The account has no testnet XLM. Use [friendbot](https://friendbot.stellar.org/). |
| The transaction is still pending after ~12 seconds | The invocation helper gives up polling and returns no receipt. The transaction may still land — check the explorer before retrying, or you risk a duplicate. |

## Next

- [Add farmer lots](/AgriBatch_Pay/using/farmer-lots/) — the step that builds the total
- [Batch lifecycle](/AgriBatch_Pay/internals/lifecycle/)
