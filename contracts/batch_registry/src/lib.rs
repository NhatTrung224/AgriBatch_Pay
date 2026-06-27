#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, Env, String,
};

#[cfg(test)]
mod test;

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum BatchStatus {
    Created,
    LotsAdded,
    QualityConfirmed,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct BatchRecord {
    pub id: String,
    pub asset_code: String,
    pub buyer: Address,
    pub cooperative: Address,
    pub crop_type: String,
    pub season: String,
    pub location: String,
    pub vault_contract: Address,
    pub lot_count: u32,
    pub quality_confirmed: bool,
    pub total_amount: i128,
    pub status: BatchStatus,
}

#[contracttype]
#[derive(Clone)]
pub enum StorageKey {
    Admin,
    Batch(String),
}

#[contract]
pub struct BatchRegistry;

fn has_administrator(env: &Env) -> bool {
    env.storage().instance().has(&StorageKey::Admin)
}

fn read_batch(env: &Env, batch_id: &String) -> BatchRecord {
    env.storage()
        .persistent()
        .get(&StorageKey::Batch(batch_id.clone()))
        .unwrap_or_else(|| panic!("batch missing"))
}

fn write_batch(env: &Env, batch: &BatchRecord) {
    env.storage()
        .persistent()
        .set(&StorageKey::Batch(batch.id.clone()), batch);
}

#[contractimpl]
impl BatchRegistry {
    pub fn init(env: Env, admin: Address) {
        if has_administrator(&env) {
            panic!("already initialized");
        }

        admin.require_auth();
        env.storage().instance().set(&StorageKey::Admin, &admin);
    }

    pub fn create_batch(
        env: Env,
        batch_id: String,
        buyer: Address,
        cooperative: Address,
        asset_code: String,
        crop_type: String,
        season: String,
        location: String,
        vault_contract: Address,
    ) -> BatchRecord {
        cooperative.require_auth();

        let key = StorageKey::Batch(batch_id.clone());
        if env.storage().persistent().has(&key) {
            panic!("batch exists");
        }

        let batch = BatchRecord {
            id: batch_id.clone(),
            asset_code,
            buyer,
            cooperative,
            crop_type,
            season,
            location,
            vault_contract,
            lot_count: 0,
            quality_confirmed: false,
            total_amount: 0,
            status: BatchStatus::Created,
        };

        write_batch(&env, &batch);
        env.events()
            .publish((symbol_short!("create"), batch_id), batch.clone());

        batch
    }

    pub fn add_farmer_lot(
        env: Env,
        batch_id: String,
        lot_id: String,
        farmer: Address,
        weight_kg: i128,
        price_per_kg: i128,
        grade: u32,
    ) -> BatchRecord {
        farmer.require_auth();

        let mut batch = read_batch(&env, &batch_id);
        let weight_multiplier = if grade == 0 { 1 } else { grade as i128 };
        let payout_amount = weight_kg * price_per_kg * weight_multiplier;

        batch.lot_count += 1;
        batch.total_amount += payout_amount;
        batch.status = BatchStatus::LotsAdded;

        write_batch(&env, &batch);
        env.events().publish(
            (symbol_short!("lot"), batch_id, lot_id),
            (farmer, payout_amount),
        );

        batch
    }

    pub fn confirm_quality(env: Env, batch_id: String, auditor: Address) -> BatchRecord {
        auditor.require_auth();

        let mut batch = read_batch(&env, &batch_id);
        if batch.lot_count == 0 {
            panic!("lots required");
        }

        batch.quality_confirmed = true;
        batch.status = BatchStatus::QualityConfirmed;

        write_batch(&env, &batch);
        env.events()
            .publish((symbol_short!("quality"), batch_id), auditor);

        batch
    }

    pub fn get_batch(env: Env, batch_id: String) -> BatchRecord {
        read_batch(&env, &batch_id)
    }
}
