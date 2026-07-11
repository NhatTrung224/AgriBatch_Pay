import "dotenv/config";

import postgres from "postgres";

async function main() {
  const sql = postgres(process.env.DATABASE_URL!, { prepare: false });
  const [proof] = await sql`
    select
      (select count(distinct public_key)::int from wallet_interactions) as distinct_wallets,
      (select count(*)::int from wallet_interactions) as wallet_interactions,
      (select count(tx_hash)::int from wallet_interactions where tx_hash is not null) as tx_hashes,
      (select count(*)::int from app_events) as app_events,
      (select array_agg(distinct tx_hash) from wallet_interactions where tx_hash is not null) as transaction_hashes
  `;

  console.log(JSON.stringify(proof, null, 2));
  await sql.end({ timeout: 5 });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
