---
title: Contracts
description: Every method on batch_registry and payout_vault — arguments, authorisation, checks, events, and what each one does not verify.
---

Two Soroban contracts, about 160 lines of Rust between them. Small enough to read in full, which is the main reason the guarantees below are worth anything.

| Contract | Testnet id | Source |
| --- | --- | --- |
| Batch registry | `CDU5E62JV6TZCUXX3JNPPKPJOVUB4X4KZP5UFDJSJO6ULFPETOKFYPD7` | `contracts/batch_registry/src/lib.rs` |
| Payout vault | `CDHX4QBID4ILQMMYEUDPBADQOLN6QZKAPA3YDDWDZR2B5BUZBSWFS5EH` | `contracts/payout_vault/src/lib.rs` |

---

## `batch_registry`

### Stored record

```rust
pub struct BatchRecord {
    id: String,
    asset_code: String,
    buyer: Address,
    cooperative: Address,
    crop_type: String,
    season: String,
    location: String,
    vault_contract: Address,
    lot_count: u32,
    quality_confirmed: bool,
    total_amount: i128,
    status: BatchStatus,   // Created | LotsAdded | QualityConfirmed
}
```

Batches live in persistent storage under `StorageKey::Batch(id)`. The admin lives in instance storage.

### `init(admin)`

Requires `admin.require_auth()`. Panics with `already initialized` on a second call.

**The admin is never used again.** No method reads it. It is a placeholder for governance that does not exist — which does at least mean a compromised admin key grants nothing.

### `create_batch(batch_id, buyer, cooperative, asset_code, crop_type, season, location, vault_contract) -> BatchRecord`

Requires **cooperative** authorisation. Panics with `batch exists` if the id is taken.

Creates the record at `Created`, `lot_count: 0`, `total_amount: 0`, `quality_confirmed: false`. Emits `create` keyed by batch id, carrying the record.

*Not checked:* that `vault_contract` is a real vault, or that `buyer` is anything in particular.

### `add_farmer_lot(batch_id, lot_id, farmer, weight_kg, price_per_kg, grade) -> BatchRecord`

Requires **farmer** authorisation — the point of the design. The cooperative cannot register a lot in a farmer's name.

```rust
let weight_multiplier = if grade == 0 { 1 } else { grade as i128 };
let payout_amount = weight_kg * price_per_kg * weight_multiplier;
batch.lot_count += 1;
batch.total_amount += payout_amount;
batch.status = BatchStatus::LotsAdded;
```

Emits `lot` keyed by batch and lot id, carrying the farmer and the payout.

*Not checked:* the batch status, so a lot can land after quality confirmation. Duplicate `lot_id`. Any bound on `grade`. There is no method to amend or remove a lot.

### `confirm_quality(batch_id, auditor) -> BatchRecord`

Requires **auditor** authorisation. Panics with `lots required` when `lot_count == 0`.

Sets `quality_confirmed: true` and status `QualityConfirmed`. Emits `quality` with the auditor.

*Not checked:* **who the auditor is.** No auditor address is stored on the batch, so any funded account can sign this. See [scope](/AgriBatch_Pay/overview/scope/#any-address-can-confirm-quality).

### `get_batch(batch_id) -> BatchRecord`

Open read, no signature. Panics with `batch missing` if unknown.

---

## `payout_vault`

### Stored record

```rust
pub struct VaultRelease {
    batch_id: String,
    buyer: Address,
    registry_contract: Address,
    funded_amount: i128,
    approved: bool,
    last_actor: Address,
    status: VaultStatus,   // Funded | SettlementApproved
}
```

### `init(admin)`

Same as the registry, and equally unused afterwards.

### `fund_vault(batch_id, buyer, registry_contract, amount) -> VaultRelease`

Requires **buyer** authorisation. Writes a fresh release at `Funded` with `approved: false`. Emits `fund` with the buyer and the amount.

**No token transfer.** There is no `token::Client` in this contract.

*Not checked:* whether a release already exists — a second call **overwrites**, resetting `approved`. Whether `amount` matches the batch total. Whether the batch was quality-confirmed. The vault never reads the registry.

### `approve_settlement(batch_id, buyer) -> VaultRelease`

Requires **buyer** authorisation, and — uniquely across both contracts — **checks the signer against the stored record**:

```rust
if release.buyer != buyer {
    panic!("buyer mismatch");
}
```

Sets `approved: true`, updates `last_actor`, status `SettlementApproved`. Emits `approve`.

This is the strongest authorisation guarantee in the system.

### `get_release(batch_id) -> VaultRelease`

Open read. Panics with `release missing` if unknown.

---

## Events

| Event | Contract | Topic | Payload |
| --- | --- | --- | --- |
| `create` | registry | batch id | the record |
| `lot` | registry | batch id, lot id | farmer, payout |
| `quality` | registry | batch id | auditor |
| `fund` | vault | batch id | buyer, amount |
| `approve` | vault | batch id | buyer |

## Panic messages

There are no typed error codes; both contracts panic with strings.

| Message | From |
| --- | --- |
| `already initialized` | `init` twice |
| `batch exists` | duplicate batch id |
| `batch missing` | unknown batch |
| `lots required` | quality on an empty batch |
| `release missing` | unknown release |
| `buyer mismatch` | wrong signer on approval |

## Properties, honestly

**Holds:** a lot is authorised by its farmer; the total is computed on chain; batch ids are unique; quality needs lots; approval requires the recorded buyer; every step emits a timestamped event.

**Does not hold:** the auditor is anyone; funding can be repeated and overwritten; funded amount is unrelated to the batch total; lots can arrive after confirmation; no contract holds or moves a token.

The full discussion is in [what it does and does not do](/AgriBatch_Pay/overview/scope/).

## Tests

Three tests per contract, in `contracts/*/src/test.rs`. Run with:

```bash
cargo test --manifest-path contracts/Cargo.toml
```

Coverage is thin relative to the surface — see [tests and CI](/AgriBatch_Pay/operate/testing/).
