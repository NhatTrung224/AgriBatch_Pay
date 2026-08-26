---
title: Database migrations
description: Drizzle Kit against Neon PostgreSQL — generating, applying and seeding.
---

AgriBatch Pay uses [Drizzle](https://orm.drizzle.team/) with Neon PostgreSQL. The schema is TypeScript in `src/lib/db/schema.ts`, and migrations are generated from it.

## Commands

```bash
npm run db:generate   # diff the schema, write SQL into drizzle/
npm run db:migrate    # apply pending migrations
npm run db:seed       # demo data
npm run db:push       # push the schema directly, no migration file
```

Each reads `.env.local` — `db:migrate` and `db:seed` through `tsx --env-file=.env.local`, `db:generate` and `db:push` through `drizzle.config.ts`.

## Generate, then apply

The normal loop:

1. Edit `src/lib/db/schema.ts`
2. `npm run db:generate` — writes SQL into `drizzle/`
3. Read the generated SQL. Drizzle infers intent from a diff, and a rename can come out as a drop and an add
4. `npm run db:migrate`
5. Commit the migration alongside the schema change

Step 3 is not optional advice. A column rename that Drizzle reads as drop-then-add compiles fine and deletes production data.

## `db:push` is for scratch databases

`drizzle-kit push` reconciles the database to the schema without producing a migration file. Fast for local iteration; wrong for anything you deploy, because the change is not recorded anywhere and the next environment has no way to reproduce it.

## Seeding

`scripts/db/seed.ts` creates demo batches, farmer lots and events so the dashboard is not empty on first run.

Two submission scripts sit alongside it:

```bash
npm run submission:seed-users    # testnet users for level-5 evidence
npm run submission:audit-proof   # audit the recorded proof
npm run feedback:audit           # audit collected user feedback
```

## What the tables hold

Five: `batches`, `farmer_lots`, `wallet_interactions`, `app_events`, `submission_evidence`. Full detail in the [schema reference](/AgriBatch_Pay/internals/schema/).

Two design points worth repeating here:

**Every index earns its keep.** `batches.updated_at` orders the directory. `farmer_lots.batch_id` filters every batch read. `wallet_interactions.created_at` and `app_events.created_at` back a poll that runs every three seconds per open event-stream connection.

**Cascades differ on purpose.** `farmer_lots` cascades on batch delete — a lot without its batch is meaningless. `app_events.batch_id` sets null instead, so the record that a batch existed survives the batch.

## Neon and TLS

Neon requires TLS. Put it in the URL:

```ini
DATABASE_URL=postgresql://user:password@host/db?sslmode=require
```

## In production

Migrations are not run by the container. `railway.json` sets no pre-deploy command, and the Dockerfile does not migrate — so applying migrations is a separate, deliberate step.

Run `npm run db:migrate` against the production database yourself before deploying a build that needs a schema change. A deploy that assumes it happened will start and then fail at the first query.

## Next

- [Schema reference](/AgriBatch_Pay/internals/schema/)
- [Deploying](/AgriBatch_Pay/operate/deploy/)
