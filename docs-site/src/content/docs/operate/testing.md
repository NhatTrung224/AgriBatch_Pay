---
title: Tests and CI
description: What is covered, what is not, and why a green run is not the same as evidence.
---

## Running them

```bash
npm run test        # Vitest
npm run typecheck   # next typegen && tsc --noEmit
npm run lint        # ESLint
npm run build       # the production build is its own check

cargo test   --manifest-path contracts/Cargo.toml
cargo clippy --manifest-path contracts/Cargo.toml
```

`typecheck` runs `next typegen` first, so generated route types exist before `tsc` looks for them. Running `tsc --noEmit` alone can fail on types that have not been generated yet.

## The TypeScript suite

Seven files, aimed at the logic where a mistake changes a number:

| File | Covers |
| --- | --- |
| `lib/batches/calculations.test.ts` | Payout arithmetic — weight × price × grade, and the totals |
| `lib/validation/batches.test.ts` | Input validation for batches and lots |
| `lib/api-error.test.ts` | Error response mapping and redaction, so a failure does not leak internals |
| `lib/formatters.test.ts` | Money, weight and date formatting |
| `features/batches/workflow.test.ts` | The batch workflow |
| `features/wallets/components/onboarding-workspace.test.tsx` | The wallet connection surface |
| `components/status-badge.test.tsx` | Status rendering |

The calculation test is the one that matters most. `weight × price × grade` is the number a farmer is paid on, and grade is a multiplier with no ceiling — an off-by-one there is somebody's income.

## The contract suite

Three tests per contract, in `contracts/batch_registry/src/test.rs` and `contracts/payout_vault/src/test.rs`.

:::caution[Coverage is thin here]
Six tests across two contracts is light for the surface. Most of the behaviour worth protecting is a refusal — a duplicate batch id, quality on an empty batch, a buyer mismatch on approval — and the [limitations in scope](/AgriBatch_Pay/overview/scope/#known-limitations) are exactly the cases no test currently pins down.

If you are extending this project, that is where the next tests belong: the checks that exist, and the ones that should.
:::

## CI

`.github/workflows/ci.yml`, on push to `main` and on pull requests.

**`contracts`** — Rust stable with clippy and `wasm32-unknown-unknown`; clippy, `cargo test`, and a release Wasm build.

**`validate`** — Node 24, `npm ci`, then typecheck, lint, test and build.

Every Node step sets the full environment inline — `DATABASE_URL` and the `NEXT_PUBLIC_` set — because the build inlines those values and would otherwise bake in defaults. Same reason as [environment](/AgriBatch_Pay/operate/environment/#the-build-time-trap).

The `DATABASE_URL` in CI is a placeholder. Nothing in the suite connects to a database, which is why the tests run without one — and also why nothing in CI would catch a broken query.

## What tests do not establish

A green run says the code does what its tests say. It does not say the contracts work on Stellar.

That claim rests on [testnet evidence](/AgriBatch_Pay/evidence/testnet/) — deployed contract ids and verified transaction hashes anyone can open in an explorer. The tests protect that behaviour from regressing; they did not demonstrate it in the first place.

Two more audits exist alongside:

```bash
npm run feedback:audit          # collected user feedback
npm run submission:audit-proof  # recorded submission evidence
```

## Next

- [Testnet evidence](/AgriBatch_Pay/evidence/testnet/)
- [What it does and does not do](/AgriBatch_Pay/overview/scope/)
