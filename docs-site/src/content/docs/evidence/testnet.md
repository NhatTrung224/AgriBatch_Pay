---
title: Deployment and transactions
description: Deployed contract ids, a verified end-to-end lifecycle, and how to check any of it without asking us.
---

Everything here is on public Stellar testnet. No account, key or permission is needed to verify any of it.

## Deployed contracts

| Contract | Testnet address | Initialization |
| --- | --- | --- |
| Batch registry | [`CDU5E62JV6TZCUXX3JNPPKPJOVUB4X4KZP5UFDJSJO6ULFPETOKFYPD7`](https://stellar.expert/explorer/testnet/contract/CDU5E62JV6TZCUXX3JNPPKPJOVUB4X4KZP5UFDJSJO6ULFPETOKFYPD7) | [`277b428a…a490`](https://stellar.expert/explorer/testnet/tx/277b428a44ac97048b61651dbe9c394555cd9131c179341916e3e6d68320a490) |
| Payout vault | [`CDHX4QBID4ILQMMYEUDPBADQOLN6QZKAPA3YDDWDZR2B5BUZBSWFS5EH`](https://stellar.expert/explorer/testnet/contract/CDHX4QBID4ILQMMYEUDPBADQOLN6QZKAPA3YDDWDZR2B5BUZBSWFS5EH) | [`3083767f…4cd6`](https://stellar.expert/explorer/testnet/tx/3083767f397d33331292d5043769b701255739c173c6aba2bb48b832858f4cd6) |

Earlier contract ids were **not** reused. Direct testnet RPC checks against them return `Contract not found`, so every configuration value and every proof link points at the active pair above.

## One complete lifecycle

Batch `QA-20260822-01`, all five operations, each signed by a **different role account**:

| Step | Signed by | Transaction |
| --- | --- | --- |
| Create batch | cooperative | [`8f9ee6df…0a52`](https://stellar.expert/explorer/testnet/tx/8f9ee6df82c334d255ddde1988f3e2671463e9c60f0ac688804bfef7a9480a52) |
| Add farmer lot | farmer | [`251e96d5…d688`](https://stellar.expert/explorer/testnet/tx/251e96d57723da483ece729c636990de36966e039d2934764ba869641ed6d688) |
| Confirm quality | auditor | [`b20a00e8…0262`](https://stellar.expert/explorer/testnet/tx/b20a00e8946e4794ff5ea676270a75cf6f6636e2adc36e723b4aaa61f2890262) |
| Fund vault | buyer | [`61422dec…2bbf`](https://stellar.expert/explorer/testnet/tx/61422dec2adc0085cec3cd46178ee7a3dcd998e366e81717cbc054ce8fb12bbf) |
| Approve settlement | buyer | [`5a904f21…bc4f`](https://stellar.expert/explorer/testnet/tx/5a904f2166d5cce3548ba6ce74f98e0728b4ba17c04c1e175097a7e0548abc4f) |

Separate accounts per role is the part worth checking. A lifecycle driven by one key would demonstrate that the methods run; five keys demonstrates that the **authorisation** works — each `require_auth()` was satisfied by a different signer.

## Scale

| | |
| --- | --- |
| Testnet accounts that signed | 55 |
| Batches completed end to end | 14 — `QA-20260822-01` through `QA-20260822-14` |
| Confirmed lifecycle invocations | 70 |
| Final registry status | `QualityConfirmed` |
| Final vault status | `SettlementApproved` |

The full hash index for batches 02–14 is in `docs/testnet-qa-contract-transactions.json`, each entry naming the operation, the source account and the transaction hash.

## Checking it yourself

**Confirm the contracts exist.** Open either contract link. A wrong or retired id returns `Contract not found`.

**Confirm a lifecycle.** Open the five transactions above. Each should invoke the expected method on the expected contract, and the source accounts should differ across the roles.

**Read the state directly.** `get_batch(batch_id)` and `get_release(batch_id)` are open reads needing no signature. Ask the contracts what they hold for `QA-20260822-01` and compare with the application.

**Compare the two contracts.** `get_batch` reports `total_amount`; `get_release` reports `funded_amount`. Nothing on chain compares them — [by design, and it is a limitation](/AgriBatch_Pay/overview/scope/#fund_vault-overwrites) — so doing it yourself is the real audit.

## What this evidence shows, and what it does not

**Shows:** both contracts are deployed and initialised; the full lifecycle executes; authorisation holds across five distinct signers; it has been exercised at some scale rather than once for a screenshot.

**Does not show:** that money moved. **The contracts transfer no tokens.** Every transaction above is a record being written, not a payment being made. See [what it does and does not do](/AgriBatch_Pay/overview/scope/).

It also does not show that the [known limitations](/AgriBatch_Pay/overview/scope/#known-limitations) were exercised — the QA batches follow the intended order, so they do not demonstrate what happens when a lot is added after quality confirmation, or when `fund_vault` is called twice.

## Live surfaces

| | |
| --- | --- |
| Application | [agribatchpay-production.up.railway.app](https://agribatchpay-production.up.railway.app/) |
| Submission page | [/submission](https://agribatchpay-production.up.railway.app/submission) |
| Liveness | [/api/health/live](https://agribatchpay-production.up.railway.app/api/health/live) |
| Repository | [NhatTrung224/AgriBatch_Pay](https://github.com/NhatTrung224/AgriBatch_Pay) |
