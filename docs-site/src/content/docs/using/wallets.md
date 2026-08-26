---
title: Connect a wallet
description: Freighter and Rabet on Stellar testnet — connecting, signing, and what gets recorded when it fails.
---

Everything in AgriBatch Pay is authorised by a wallet signature. There are no passwords, and the platform holds no key.

## Wallets

| Wallet | Adapter |
| --- | --- |
| [Freighter](https://www.freighter.app/) | `src/features/wallets/lib/freighter-adapter.ts` |
| [Rabet](https://rabet.io/) | `src/features/wallets/lib/rabet-adapter.ts` |

Both are browser extensions, both keep your key, and both expose the same interface to the app through a shared `WalletAdapter` type.

## Set the network first

AgriBatch Pay runs on **Stellar testnet**. Switch the extension to testnet before connecting, and fund the account from [friendbot](https://friendbot.stellar.org/).

:::danger[No recovery phrase, ever]
This application has no field that accepts a recovery phrase and will never ask for one. A page asking you to type your twelve or twenty-four words is stealing from you — including one that looks exactly like this product.
:::

## Connecting

Open **Onboarding** and choose a provider. The extension asks to share your public address; approving shares the address and nothing else.

The connect flow lives in `src/features/wallets/components/onboarding-workspace.tsx`, rendered by `src/app/(platform)/onboarding/page.tsx`.

## What a signature does

Every on-chain action goes through `invokeSorobanContract` in `src/lib/soroban/invoke-contract.ts`, which:

1. Loads your account from Soroban RPC
2. Builds the invocation and **prepares** it — simulating so the footprint and resource fees are right
3. Hands it to your wallet adapter to sign
4. Submits it
5. **Polls for the result** — up to eight attempts, 1.5 seconds apart

That polling matters. Soroban submission returns before the transaction is final, so a client that stops at "submitted" reports success for transactions that later fail. This one waits for `SUCCESS`, raises on `FAILED`, and returns null if it is still pending after roughly twelve seconds.

Read the wallet's own screen before approving. The extension is the part that cannot lie to you about what you are signing.

## Failures are recorded

Every wallet interaction is written to `wallet_interactions` with the provider, the role, the action, the contract address, the transaction hash — and `success: false` plus an `error_message` when it did not work.

A rejected signature and a failed submission are both rows. That is deliberate: a proof surface that counted only successes would overstate how well the product works and hide exactly the problems worth fixing.

## Roles are not permissions

The role you pick shapes the interface. It does not decide what the contract accepts.

`approve_settlement` compares your signing address against the buyer recorded on the release, and refuses a mismatch. Choosing "buyer" in the app grants nothing on a release that names someone else — see [who uses it](/AgriBatch_Pay/overview/actors/#who-can-call-what).

## Next

- [Register a batch](/AgriBatch_Pay/using/register-a-batch/)
- [Contract invocation path](/AgriBatch_Pay/internals/invocation/)
