// UF Scheduler's "N online" count: a Cloudflare Worker at
// www.jacobkulberg.com/projects/uf-scheduler/online (wrangler.toml).
//
// Each open tab holds a WebSocket to one Durable Object, which sends every
// tab {"active_users": n} whenever someone arrives or leaves. The sockets use
// the hibernation API and pings get an automatic "pong", so the object sleeps
// (and costs nothing) between arrivals and departures.
//
// Each hour's peak count is kept in the object's SQLite table hourly_peak
// (hour in UTC, e.g. "2026-10-05T14:00Z"), and copied to the KV namespace
// uf-scheduler-online-peaks (key = hour, value = peak) so the dashboard's KV
// browser shows it.
//
// Deploy, from this folder: npx wrangler deploy

import { DurableObject } from "cloudflare:workers";

// The site is also reachable over plain http, where the page connects with ws://
const ALLOWED_ORIGINS = [
  "https://www.jacobkulberg.com",
  "https://jacobkulberg.com",
  "http://www.jacobkulberg.com",
  "http://jacobkulberg.com",
];

// Tabs ping every 30s (every 60s at most once a browser throttles a background
// tab); a socket that's been quiet for longer has gone without closing
const STALE_MS = 150_000;
const SWEEP_MS = 60_000;

export default {
  async fetch(request, env) {
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Expected a WebSocket", { status: 426 });
    }
    const origin = request.headers.get("Origin") ?? "";
    if (
      !ALLOWED_ORIGINS.includes(origin) &&
      !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
    ) {
      return new Response("Forbidden", { status: 403 });
    }
    const online = env.ONLINE.get(env.ONLINE.idFromName("uf-scheduler"));
    return online.fetch(request);
  },
};

export class Online extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    ctx.setWebSocketAutoResponse(
      new WebSocketRequestResponsePair("ping", "pong"),
    );
    ctx.storage.sql.exec(
      "CREATE TABLE IF NOT EXISTS hourly_peak (hour TEXT PRIMARY KEY, peak INTEGER NOT NULL)",
    );
  }

  async fetch() {
    const [client, server] = Object.values(new WebSocketPair());
    this.ctx.acceptWebSocket(server);
    server.serializeAttachment({ connectedAt: Date.now() });
    this.broadcast();
    if ((await this.ctx.storage.getAlarm()) === null) {
      await this.ctx.storage.setAlarm(Date.now() + SWEEP_MS);
    }
    return new Response(null, { status: 101, webSocket: client });
  }

  webSocketClose(ws) {
    try {
      ws.close();
    } catch {}
    this.broadcast();
  }

  webSocketError() {
    this.broadcast();
  }

  // Closes sockets that stopped pinging, while anyone is connected
  async alarm() {
    const now = Date.now();
    let closed = false;
    for (const ws of this.openSockets()) {
      const lastPing = this.ctx.getWebSocketAutoResponseTimestamp(ws);
      const lastSeen = Math.max(
        lastPing?.getTime() ?? 0,
        ws.deserializeAttachment()?.connectedAt ?? 0,
      );
      if (now - lastSeen > STALE_MS) {
        ws.close(4000, "No ping");
        closed = true;
      }
    }
    if (closed) this.broadcast();
    if (this.openSockets().length) {
      await this.ctx.storage.setAlarm(now + SWEEP_MS);
    }
  }

  openSockets() {
    return this.ctx
      .getWebSockets()
      .filter((ws) => ws.readyState === WebSocket.OPEN);
  }

  broadcast() {
    const sockets = this.openSockets();
    const message = JSON.stringify({ active_users: sockets.length });
    for (const ws of sockets) {
      try {
        ws.send(message);
      } catch {}
    }
    this.recordPeak(sockets.length);
  }

  // Only writes when the count beats this hour's peak so far
  recordPeak(count) {
    const hour = new Date().toISOString().slice(0, 13) + ":00Z";
    const raised = this.ctx.storage.sql
      .exec(
        `INSERT INTO hourly_peak (hour, peak) VALUES (?, ?)
         ON CONFLICT (hour) DO UPDATE SET peak = excluded.peak
         WHERE excluded.peak > hourly_peak.peak
         RETURNING peak`,
        hour,
        count,
      )
      .toArray().length;
    if (raised) this.env.PEAKS.put(hour, String(count)).catch(() => {});
  }
}
