---
title: Health checks
description: Two endpoints, two questions — and why collapsing them into one made an outage worse.
---

AgriBatch Pay has two health endpoints because "is it alive" and "can it serve" are different questions with different right answers.

## `/api/health/live` — liveness

```json
{ "service": "agribatch-pay", "status": "ok" }
```

Always `200`. Touches nothing — no database, no network. If this responds, the Node process is running and serving HTTP.

This is what the platform health check watches.

## `/api/health` — readiness

Runs `select 1` and times the round trip:

```json
{
  "database": "ok",
  "latencyMs": 12,
  "service": "agribatch-pay",
  "status": "ok",
  "timestamp": "2026-08-26T10:00:00.000Z"
}
```

On failure it logs and answers **`503`**:

```json
{
  "database": "unreachable",
  "service": "agribatch-pay",
  "status": "degraded",
  "timestamp": "…"
}
```

## Why they are split

The handler carries this comment, and it is the whole story:

> The old handler answered "ok" unconditionally, so an instance that had lost its database still reported healthy and kept receiving traffic. **A health check that cannot fail is not a health check.**

So `/api/health` was made to fail honestly. But that alone would have created the opposite problem: a restart policy watching an endpoint that fails whenever Postgres blips will restart the container over a database problem — and restarting a container does not fix a database. With `restartPolicyMaxRetries: 3`, a thirty-second Neon hiccup could take the service down permanently.

Two endpoints resolve it:

| Watcher | Endpoint | Because |
| --- | --- | --- |
| Platform restart policy | `/api/health/live` | Restart only when the process is genuinely gone |
| Your monitoring, load balancer, alerting | `/api/health` | Know when it cannot serve, without killing it |

## Which to use where

**Point a restart policy at liveness.** Restarts fix crashed processes. They do not fix databases, networks or upstream services.

**Point traffic decisions at readiness.** A load balancer should stop sending requests to an instance that cannot reach its database — that is what `503` is for.

**Alert on readiness, page on liveness.** A degraded instance needs attention. A dead one needs it faster.

## Checking

```bash
curl -i https://agribatchpay-production.up.railway.app/api/health/live
curl -i https://agribatchpay-production.up.railway.app/api/health
```

The second should return `200` with `"database": "ok"` and a small `latencyMs`. A rising latency with a still-ok status is the earliest signal you get before the `503`.

## Related

The event stream at `/api/events` has its own resilience story — a long-lived timer whose unhandled rejection could terminate the process. See [watch the event stream](/AgriBatch_Pay/using/events/#the-bug-that-shaped-this-code).

Both come from the same lesson: **the thing that reports on your system must be able to report failure, and must not itself be a way to fail.**

## Next

- [Deploying](/AgriBatch_Pay/operate/deploy/)
- [HTTP API](/AgriBatch_Pay/internals/api/)
