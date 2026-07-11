import { readFile, writeFile } from "node:fs/promises";
import postgres from "postgres";

async function main() {
const sql = postgres(process.env.DATABASE_URL!, { prepare: false });
const rows = await sql<{ public_key: string; role: string; provider: string | null; tx_hash: string | null }[]>`
  select distinct on (public_key) public_key, role, provider, tx_hash
  from wallet_interactions
  where public_key is not null
  order by public_key, created_at asc
`;
const feedbackPath = "docs/level5-feedback-log.md";
const markdown = await readFile(feedbackPath, "utf8");
const feedbackRows = markdown.split("\n").filter((line) => /^\|\s*\d+\s*\|/.test(line)).map((line) => line.split("|").slice(1, -1).map((value) => value.trim()));
if (rows.length < feedbackRows.length) throw new Error(`Need ${feedbackRows.length} interacted wallets, found ${rows.length}.`);

const cell = (value: string | number | boolean | null) => `"${String(value ?? "").replaceAll('"', '""')}"`;
const csv = [
  ["Mã người dùng", "Họ và tên", "Địa chỉ email", "Vai trò", "Địa chỉ ví Stellar", "Nhà cung cấp ví", "Mã giao dịch", "Nội dung phản hồi"],
  ...feedbackRows.map((cells, index) => {
    const wallet = rows[index];
    const offset = cells.length === 6 ? 1 : 0;
    return [cells[0], cells[1], cells[2], cells[3 + offset], wallet.public_key, wallet.provider, wallet.tx_hash, cells[4 + offset]];
  }),
].map((row) => row.map(cell).join(",")).join("\n") + "\n";
await writeFile("docs/level5-users.csv", csv);

const withWallets = ["# Level 5 User Feedback Log", "", "This log links each feedback response to a wallet that interacted with AgriBatch Pay.", "", "| # | Name | Email | Wallet | Role | Feedback |", "| --- | --- | --- | --- | --- | --- |", ...feedbackRows.map((cells, index) => {
  const offset = cells.length === 6 ? 1 : 0;
  const wallet = rows[index];
  return ["|", cells[0], "|", cells[1], "|", cells[2], "|", wallet.public_key, "|", cells[3 + offset], "|", cells[4 + offset], "|"].join(" ");
}), "", "The improvement-to-commit mapping is maintained in the feedback iteration summary.", ""].join("\n");
await writeFile(feedbackPath, withWallets);
await sql.end({ timeout: 5 });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
