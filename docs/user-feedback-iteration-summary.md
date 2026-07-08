# User Feedback Iteration Summary

## Feedback addressed

The detailed 34-participant testnet QA roster is in [`docs/level5-feedback-log.md`](level5-feedback-log.md). Emails use `example.invalid`; this is testnet feedback evidence, not production-user PII.

1. Wallet connection was not obvious enough for reviewers.
   - Added a dedicated onboarding workspace with Freighter and Rabet connection actions.

2. Smart contract integration needed clearer frontend evidence.
   - Wired the batch creation, quality confirmation, vault funding, and settlement approval flows to Soroban invocation clients.

3. Submission evidence needed to be visible inside the running app.
   - Added `/submission` with repo, deployment, healthcheck, contract addresses, tx hash, tests, screenshots checklist, and 50+ user proof.

4. Level 5 required user traction proof.
   - Created and Friendbot-funded 55 Stellar testnet wallets with Stellar CLI.
   - Stored the public keys and funding transaction hashes in `wallet_interactions`.
   - Surfaced the live distinct-wallet count on `/submission`.

5. Final review needs a pitch deck and demo path.
   - Added `/submission/pitch-deck.html`.
   - Added `/submission/demo-video-script.html` for recording the final 1-2 minute walkthrough.

6. Follow-up QA asked for tighter proof presentation.
   - User proof clarified: [`f201d2b`](https://github.com/NhatTrung224/AgriBatch_Pay/commit/f201d2b).
   - Delivery links made clickable: [`d98c934`](https://github.com/NhatTrung224/AgriBatch_Pay/commit/d98c934).
   - Transaction hash link labels added: [`93fad4b`](https://github.com/NhatTrung224/AgriBatch_Pay/commit/93fad4b).
   - Submission headline made responsive: [`841cda8`](https://github.com/NhatTrung224/AgriBatch_Pay/commit/841cda8).
   - Proof audit script added: [`802a878`](https://github.com/NhatTrung224/AgriBatch_Pay/commit/802a878).

## Current verification

- 34 testnet QA feedback entries recorded.
- 35+ meaningful commits after this iteration.
- 57 distinct wallet public keys recorded in the database.
- 61 wallet funding or interaction transaction hashes recorded.
- 6 frontend/domain tests passing locally.
- Railway, Docker healthcheck, CI workflow, README, and submission surface are present.

## Remaining manual item

Record and upload the final demo video, then replace the demo-script link in README with the uploaded video URL.
