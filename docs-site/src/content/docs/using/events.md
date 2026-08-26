---
title: Watch the event stream
description: The server-sent event feed at /api/events, what it carries, and the failure mode that shaped it.
---

A settlement takes a while and involves people in different places. The event stream is how a cooperative watches lots arrive without refreshing a page.

## The endpoint

```
GET /api/events
```

A [server-sent events](https://developer.mozilla.org/docs/Web/API/Server-sent_events) stream. Open it and the server pushes new events as they are written.

```js
const source = new EventSource("/api/events");
source.addEventListener("app-event", (event) => {
  console.log(JSON.parse(event.data));
});
```

## What it carries

Rows from `app_events`, each with a type, a message, an optional batch id, an optional transaction hash and a JSON metadata blob.

The types cover the lifecycle: batch creation, lot registration, quality confirmation, vault funding, settlement approval.

On connect the stream starts from **one hour ago**, so a page opened mid-settlement gets recent context rather than an empty panel, then follows live.

## How it polls

The handler keeps a `latestSeen` timestamp and queries for anything newer every three seconds, oldest first, advancing the marker as it goes. `app_events` carries an index on `created_at` for exactly this query — it runs once per open connection, every three seconds, so it had better be cheap.

## The bug that shaped this code

The handler is defensive in a way that looks like over-engineering until you know why.

The pump runs on a timer for the life of the connection. Originally, a single failed query escaped as an **unhandled rejection** — and then repeated every three seconds. Under Node 24 an unhandled rejection terminates the process, so one bad query on one stream took down the whole server rather than the one connection.

Enqueueing to a closed stream throws for the same reason: a client that disconnects mid-tick leaves a timer that fires into a controller nobody is reading.

Both are now caught, and the pump checks whether it has been closed before doing anything. The lesson generalises: **a long-lived timer that touches a database needs its own error boundary**, because the caller that could have handled the error returned long ago.

## Two health endpoints, deliberately

While you are looking at long-lived connections, it is worth knowing the health routes are split:

| Route | Answers | Touches the database |
| --- | --- | --- |
| `/api/health/live` | Always `200` | No |
| `/api/health` | `200` or `503` when the database is unreachable | Yes |

Liveness and readiness are different questions. A platform health check pointed at `/api/health/live` restarts a container only when the process is genuinely gone; one pointed at `/api/health` will also restart it during a database blip, which does not fix the database.

See [health checks](/AgriBatch_Pay/operate/health/) for which to use where.

## Next

- [HTTP API](/AgriBatch_Pay/internals/api/)
- [Health checks](/AgriBatch_Pay/operate/health/)
