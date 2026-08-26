---
title: Contract invocation path
description: How a button press becomes a confirmed Soroban transaction — prepare, sign, submit, poll.
---

Every on-chain action in AgriBatch Pay goes through one function: `invokeSorobanContract` in `src/lib/soroban/invoke-contract.ts`.

## The signature

```ts
invokeSorobanContract<T>({
  args,        // xdr.ScVal[]
  contractId,  // which contract
  method,      // which method
  wallet,      // { adapter, publicKey }
}): Promise<SorobanInvocationReceipt<T>>
```

Returning:

```ts
type SorobanInvocationReceipt<T> = {
  contractId: string;
  hash: string;
  method: string;
  returnValue: T | null;
};
```

## The four steps

### 1. Load the account

`server.getAccount(publicKey)` from Soroban RPC — needed for the sequence number.

### 2. Build and prepare

A `TransactionBuilder` with `BASE_FEE` and the network passphrase, carrying the contract invocation. Then:

```ts
const prepared = await server.prepareTransaction(tx);
```

`prepareTransaction` **simulates** the call and writes back the resource footprint and the resource fee.

This is not optional. A Soroban invocation submitted without simulation carries no footprint and fails. Simulation is also the first place a bad argument surfaces — a wrong type or a missing account shows up here, before the user is asked to sign.

### 3. Sign

The prepared XDR goes to the wallet adapter. Freighter and Rabet implement the same `WalletAdapter` interface, so this call does not care which extension is connected.

**The server never signs.** It holds no Stellar key, which is why a compromised deployment cannot create a batch or approve a settlement.

### 4. Submit and poll

Submission returns before the transaction is final, so the helper polls:

```ts
for (let attempt = 0; attempt < 8; attempt += 1) {
  const response = await server.getTransaction(hash);
  if (response.status === SUCCESS) return response;
  if (response.status === FAILED) throw new Error(`Soroban transaction ${hash} failed on-chain.`);
  await wait(1500);
}
return null;
```

Eight attempts, 1.5 seconds apart — roughly twelve seconds.

:::caution[Three outcomes, not two]
`SUCCESS` returns the result. `FAILED` raises. And **still pending after twelve seconds returns `null`** — the transaction was submitted and may yet land.

A caller that treats `null` as failure and retries risks a duplicate. Check the explorer for the hash before retrying anything that is not idempotent, which in this system means anything except a read.
:::

## Why the polling matters

Without it, a client stops at "submitted" and reports success. Soroban transactions can fail *after* acceptance — an unsatisfied auth requirement or a panic inside the contract shows up at execution, not at submission.

A UI that says "batch created" on submission is wrong roughly as often as contracts panic. Waiting for `SUCCESS` means the confirmation the user sees corresponds to something that actually happened.

## Return values

Results come back as `ScVal` and are converted with `scValToNative`, so a caller gets a plain JavaScript object rather than XDR. Each contract method returns its record — `BatchRecord` or `VaultRelease` — so the caller has the post-call state without a second read.

## Per-contract wrappers

`src/lib/soroban/registry-contract.ts` and `payout-vault-contract.ts` wrap the raw invocation per method, handling argument conversion. Callers work in domain terms; only the wrappers deal in `ScVal`.

Network configuration — RPC server and passphrase — lives in `src/lib/soroban/network.ts`, read from `NEXT_PUBLIC_STELLAR_RPC_URL` and `NEXT_PUBLIC_STELLAR_NETWORK`.

## Where it is called from

| Action | Component |
| --- | --- |
| `create_batch` | `src/features/batches/components/create-batch-form.tsx` |
| `confirm_quality`, `fund_vault`, `approve_settlement` | `src/features/batches/components/batch-detail-workspace.tsx` |
| Wallet connection | `src/features/wallets/components/onboarding-workspace.tsx` |

## Next

- [Contracts](/AgriBatch_Pay/internals/contracts/)
- [HTTP API](/AgriBatch_Pay/internals/api/)
