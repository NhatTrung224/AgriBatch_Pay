# Testnet contract deployment and QA record

Updated: 2026-08-22

## Active contracts

| Contract | Testnet address | Evidence |
| --- | --- | --- |
| Batch registry | [`CDU5…YPD7`](https://stellar.expert/explorer/testnet/contract/CDU5E62JV6TZCUXX3JNPPKPJOVUB4X4KZP5UFDJSJO6ULFPETOKFYPD7) | [Initialization](https://stellar.expert/explorer/testnet/tx/277b428a44ac97048b61651dbe9c394555cd9131c179341916e3e6d68320a490) |
| Payout vault | [`CDHX…S5EH`](https://stellar.expert/explorer/testnet/contract/CDHX4QBID4ILQMMYEUDPBADQOLN6QZKAPA3YDDWDZR2B5BUZBSWFS5EH) | [Initialization](https://stellar.expert/explorer/testnet/tx/3083767f397d33331292d5043769b701255739c173c6aba2bb48b832858f4cd6) |

## Verified lifecycle

Batch `QA-20260822-01` completed the five contract operations with separate role accounts:

| Operation | Testnet transaction |
| --- | --- |
| Create batch | [8f9ee6df…0a52](https://stellar.expert/explorer/testnet/tx/8f9ee6df82c334d255ddde1988f3e2671463e9c60f0ac688804bfef7a9480a52) |
| Add farmer lot | [251e96d5…d688](https://stellar.expert/explorer/testnet/tx/251e96d57723da483ece729c636990de36966e039d2934764ba869641ed6d688) |
| Confirm quality | [b20a00e8…0262](https://stellar.expert/explorer/testnet/tx/b20a00e8946e4794ff5ea676270a75cf6f6636e2adc36e723b4aaa61f2890262) |
| Fund vault | [61422dec…2bbf](https://stellar.expert/explorer/testnet/tx/61422dec2adc0085cec3cd46178ee7a3dcd998e366e81717cbc054ce8fb12bbf) |
| Approve settlement | [5a904f21…bc4f](https://stellar.expert/explorer/testnet/tx/5a904f2166d5cce3548ba6ce74f98e0728b4ba17c04c1e175097a7e0548abc4f) |

## QA account activity

- 55 Testnet accounts signed the deployment/setup or batch lifecycle steps.
- 14 batches, `QA-20260822-01` through `QA-20260822-14`, completed with registry status `QualityConfirmed` and vault status `SettlementApproved`.
- 70 lifecycle contract invocations were confirmed. The complete transaction-hash index for batches 02–14 is available in [testnet-qa-contract-transactions.json](testnet-qa-contract-transactions.json).

The old contract IDs were not reused: direct Testnet RPC checks returned `Contract not found`, so all current configuration and proof link to the active pair above.
