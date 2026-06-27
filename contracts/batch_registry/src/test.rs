extern crate std;

use soroban_sdk::{testutils::Address as _, Address, Env, String};

use crate::{BatchRegistry, BatchRegistryClient, BatchStatus};

fn sample_batch_id(env: &Env) -> String {
    String::from_str(env, "BATCH-REG-001")
}

#[test]
fn creates_batch_record() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(BatchRegistry, ());
    let client = BatchRegistryClient::new(&env, &contract_id);
    let admin = Address::generate(&env);
    let buyer = Address::generate(&env);
    let cooperative = Address::generate(&env);
    let vault = Address::generate(&env);

    client.init(&admin);
    let batch = client.create_batch(
        &sample_batch_id(&env),
        &buyer,
        &cooperative,
        &String::from_str(&env, "USDC"),
        &String::from_str(&env, "Robusta Coffee"),
        &String::from_str(&env, "Monsoon 2026"),
        &String::from_str(&env, "Dak Lak"),
        &vault,
    );

    assert_eq!(batch.status, BatchStatus::Created);
    assert_eq!(batch.total_amount, 0);
    assert_eq!(batch.lot_count, 0);
}

#[test]
fn adds_farmer_lot_and_accumulates_total() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(BatchRegistry, ());
    let client = BatchRegistryClient::new(&env, &contract_id);
    let admin = Address::generate(&env);
    let buyer = Address::generate(&env);
    let cooperative = Address::generate(&env);
    let vault = Address::generate(&env);
    let farmer = Address::generate(&env);

    client.init(&admin);
    client.create_batch(
        &sample_batch_id(&env),
        &buyer,
        &cooperative,
        &String::from_str(&env, "USDC"),
        &String::from_str(&env, "Arabica"),
        &String::from_str(&env, "Spring 2026"),
        &String::from_str(&env, "Lam Dong"),
        &vault,
    );

    let updated = client.add_farmer_lot(
        &sample_batch_id(&env),
        &String::from_str(&env, "LOT-001"),
        &farmer,
        &120,
        &9,
        &2,
    );

    assert_eq!(updated.status, BatchStatus::LotsAdded);
    assert_eq!(updated.lot_count, 1);
    assert_eq!(updated.total_amount, 2160);
}

#[test]
fn confirms_quality_after_lots_exist() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(BatchRegistry, ());
    let client = BatchRegistryClient::new(&env, &contract_id);
    let admin = Address::generate(&env);
    let buyer = Address::generate(&env);
    let cooperative = Address::generate(&env);
    let auditor = Address::generate(&env);
    let vault = Address::generate(&env);
    let farmer = Address::generate(&env);

    client.init(&admin);
    client.create_batch(
        &sample_batch_id(&env),
        &buyer,
        &cooperative,
        &String::from_str(&env, "USDC"),
        &String::from_str(&env, "Arabica"),
        &String::from_str(&env, "Spring 2026"),
        &String::from_str(&env, "Lam Dong"),
        &vault,
    );
    client.add_farmer_lot(
        &sample_batch_id(&env),
        &String::from_str(&env, "LOT-001"),
        &farmer,
        &120,
        &9,
        &2,
    );

    let updated = client.confirm_quality(&sample_batch_id(&env), &auditor);

    assert_eq!(updated.status, BatchStatus::QualityConfirmed);
    assert!(updated.quality_confirmed);
}
