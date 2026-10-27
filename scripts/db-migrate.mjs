// Applies db/migrations/*.sql, in order, to the database named by DATABASE_URL.
//
//   npm run db:migrate            -> shows the target and the pending migrations (changes nothing)
//   npm run db:migrate -- --apply -> applies them
//
// Each migration and its bookkeeping row run in one transaction, so a failure leaves nothing
// half-applied. Migrations are additive and plain SQL: one statement per ";" (no function bodies).
// The target is printed without credentials; check it is the environment you mean before --apply.
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL tanımlı değil (.env.local ya da ortam değişkeni).");
  process.exit(1);
}
const apply = process.argv.includes("--apply");
const target = new URL(url);
console.log(`Hedef: ${target.hostname}${target.pathname}`);

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "db", "migrations");
const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();
const sql = neon(url);

// The dry run must not change anything, so the bookkeeping table is only created with --apply.
if (apply) await sql.query("create table if not exists schema_migrations (name text primary key, applied_at timestamptz not null default now())");
const hasLedger = (await sql.query("select to_regclass('public.schema_migrations') as t"))[0].t !== null;
const done = new Set(hasLedger ? (await sql.query("select name from schema_migrations")).map((r) => r.name) : []);
const pending = files.filter((f) => !done.has(f));

console.log(pending.length ? `Bekleyen: ${pending.join(", ")}` : "Bekleyen migration yok.");
if (!apply || pending.length === 0) {
  if (pending.length) console.log("Uygulamak için: npm run db:migrate -- --apply");
  process.exit(0);
}

for (const file of pending) {
  const text = (await readFile(path.join(dir, file), "utf8")).replace(/--.*$/gm, "");
  const statements = text.split(";").map((s) => s.trim()).filter(Boolean);
  await sql.transaction((txn) => [
    ...statements.map((s) => txn.query(s)),
    txn.query("insert into schema_migrations (name) values ($1)", [file]),
  ]);
  console.log(`Uygulandı: ${file}`);
}
