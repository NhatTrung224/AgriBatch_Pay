---
title: HTTP API
description: Nine route handlers under /api — batches, lots, quality, funding, approval, the event stream and two health endpoints.
---

All route handlers, all in the same Next.js deployment. There is no separate service.

Everything under `/api/batches` mirrors state that a wallet already committed on chain. **These routes do not move anything on Stellar** — the browser does that directly through [the invocation path](/AgriBatch_Pay/internals/invocation/), then tells the server what happened.

## Batches

### `GET /api/batches`

Lists batches, ordered by `updated_at` — which is why that column carries an index.

### `POST /api/batches`

Records a batch after `create_batch` succeeded on chain.

### `GET /api/batches/:id`

One batch with its farmer lots.

### `GET /api/batches/:id/lots` · `POST /api/batches/:id/lots`

Reads and records farmer lots. A `POST` follows a successful `add_farmer_lot`, carrying the farmer, weight, price, grade and the computed payout.

### `POST /api/batches/:id/quality`

Records a quality confirmation after `confirm_quality`.

### `POST /api/batches/:id/fund`

Records vault funding after `fund_vault`.

### `POST /api/batches/:id/approve`

Records settlement approval after `approve_settlement`.

:::note[The order is chain first, server second]
Each of these follows a confirmed transaction. The invocation helper polls until Soroban reports `SUCCESS`, and only then does the app tell the server.

That ordering means the database can lag the chain — a browser closed between the two leaves a transaction with no mirror row — but it can never claim something the chain did not do. Given only one of the two can be authoritative, lagging is the right failure.
:::

## Events

### `GET /api/events`

A server-sent event stream over `app_events`, starting one hour back and polling every three seconds.

```js
const source = new EventSource("/api/events");
source.addEventListener("app-event", (e) => console.log(JSON.parse(e.data)));
```

See [watch the event stream](/AgriBatch_Pay/using/events/) for the failure mode that shaped its error handling.

## Health

Two endpoints, two different questions.

### `GET /api/health/live`

```json
{ "service": "agribatch-pay", "status": "ok" }
```

Always `200`. Touches nothing. **Liveness** — is the process running.

### `GET /api/health`

```json
{
  "database": "ok",
  "latencyMs": 12,
  "service": "agribatch-pay",
  "status": "ok",
  "timestamp": "2026-08-26T10:00:00.000Z"
}
```

Runs `select 1`. On failure it logs and answers **`503`**:

```json
{ "database": "unreachable", "service": "agribatch-pay", "status": "degraded", "timestamp": "…" }
```

**Readiness** — can this instance serve traffic.

The split exists because a health check that cannot fail is not a health check. The previous handler answered `ok` unconditionally, so an instance that had lost its database kept receiving traffic. Now `/api/health` fails honestly, and `/api/health/live` remains available for the platform check that should not restart a container over a database blip.

See [health checks](/AgriBatch_Pay/operate/health/) for which to point where.

## Next

- [Database schema](/AgriBatch_Pay/internals/schema/)
- [Contract invocation path](/AgriBatch_Pay/internals/invocation/)
