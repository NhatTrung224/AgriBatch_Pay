#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, Env, String,
};

#[cfg(test)]
mod test;

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum VaultStatus {
    Funded,
    SettlementApproved,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct VaultRelease {
    pub batch_id: String,
    pub buyer: Address,
    pub registry_contract: Address,
    pub funded_amount: i128,
    pub approved: bool,
    pub last_actor: Address,
    pub status: VaultStatus,
}

#[contracttype]
#[derive(Clone)]
pub enum StorageKey {
    Admin,
    Release(String),
}

#[contract]
pub struct PayoutVault;

fn has_administrator(env: &Env) -> bool {
    env.storage().instance().has(&StorageKey::Admin)
}

fn read_release(env: &Env, batch_id: &String) -> VaultRelease {
    env.storage()
        .persistent()
        .get(&StorageKey::Release(batch_id.clone()))
        .unwrap_or_else(|| panic!("release missing"))
}

fn write_release(env: &Env, release: &VaultRelease) {
    env.storage()
        .persistent()
        .set(&StorageKey::Release(release.batch_id.clone()), release);
}

#[contractimpl]
impl PayoutVault {
    pub fn init(env: Env, admin: Address) {
        if has_administrator(&env) {
            panic!("already initialized");
        }

        admin.require_auth();
        env.storage().instance().set(&StorageKey::Admin, &admin);
    }

    pub fn fund_vault(
        env: Env,
        batch_id: String,
        buyer: Address,
        registry_contract: Address,
        amount: i128,
    ) -> VaultRelease {
        buyer.require_auth();

        let release = VaultRelease {
            batch_id: batch_id.clone(),
            buyer: buyer.clone(),
            registry_contract,
            funded_amount: amount,
            approved: false,
            last_actor: buyer.clone(),
            status: VaultStatus::Funded,
        };

        write_release(&env, &release);
        env.events()
            .publish((symbol_short!("fund"), batch_id), (buyer, amount));

        release
    }

    pub fn approve_settlement(env: Env, batch_id: String, buyer: Address) -> VaultRelease {
        buyer.require_auth();

        let mut release = read_release(&env, &batch_id);
        if release.buyer != buyer {
            panic!("buyer mismatch");
        }

        release.approved = true;
        release.last_actor = buyer.clone();
        release.status = VaultStatus::SettlementApproved;

        write_release(&env, &release);
        env.events()
            .publish((symbol_short!("approve"), batch_id), buyer);

        release
    }

    pub fn get_release(env: Env, batch_id: String) -> VaultRelease {
        read_release(&env, &batch_id)
    }
}
