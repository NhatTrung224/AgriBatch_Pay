extern crate std;

use soroban_sdk::{testutils::Address as _, Address, Env, String};

use crate::{PayoutVault, PayoutVaultClient, VaultStatus};

fn sample_batch_id(env: &Env) -> String {
    String::from_str(env, "BATCH-VLT-001")
}

#[test]
fn funds_vault_release() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(PayoutVault, ());
    let client = PayoutVaultClient::new(&env, &contract_id);
    let admin = Address::generate(&env);
    let buyer = Address::generate(&env);
    let registry = Address::generate(&env);

    client.init(&admin);
    let release =
        client.fund_vault(&sample_batch_id(&env), &buyer, &registry, &24_500);

    assert_eq!(release.status, VaultStatus::Funded);
    assert_eq!(release.funded_amount, 24_500);
    assert!(!release.approved);
}

#[test]
fn approves_existing_settlement() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(PayoutVault, ());
    let client = PayoutVaultClient::new(&env, &contract_id);
    let admin = Address::generate(&env);
    let buyer = Address::generate(&env);
    let registry = Address::generate(&env);

    client.init(&admin);
    client.fund_vault(&sample_batch_id(&env), &buyer, &registry, &24_500);

    let release = client.approve_settlement(&sample_batch_id(&env), &buyer);

    assert_eq!(release.status, VaultStatus::SettlementApproved);
    assert!(release.approved);
}

#[test]
fn reads_release_after_funding() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(PayoutVault, ());
    let client = PayoutVaultClient::new(&env, &contract_id);
    let admin = Address::generate(&env);
    let buyer = Address::generate(&env);
    let registry = Address::generate(&env);

    client.init(&admin);
    client.fund_vault(&sample_batch_id(&env), &buyer, &registry, &24_500);

    let release = client.get_release(&sample_batch_id(&env));

    assert_eq!(release.buyer, buyer);
    assert_eq!(release.registry_contract, registry);
}
