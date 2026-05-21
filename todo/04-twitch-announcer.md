# PR 4 — Twitch Stream Announcer (feature-flagged)

Poll Twitch for a configured streamer and post an announcement when they go live.

## Toggle

`FF_TWITCH_ANNOUNCER=true`

## Approach

**Polling, not EventSub webhooks.** EventSub needs a public HTTPS endpoint — too much infra for one streamer. Poll Helix `GET /streams?user_login=<name>` on an interval (default 60s).

`axios` is already a dependency — use it for the Helix calls.

## New service: `src/services/twitch.ts`

- Client-credentials OAuth flow against `https://id.twitch.tv/oauth2/token`.
- Cache the bearer token in memory; refresh ~5 min before its `expires_in`.
- Export `isLive(username): Promise<HelixStream | null>` — returns the stream object when live, `null` otherwise.

## New service: `src/services/twitchAnnouncer.ts`

- `start(client: Client)` — kicks off a `setInterval` poll loop.
- In-memory `wasLive: boolean`, initialized `false`.
- On `false → true` transition: post an embed to the configured channel.
- Embed fields: streamer name, stream title, game, viewer count, thumbnail, link to `twitch.tv/<name>`.
- On `true → false`: just flip the flag, no message.

**Known limitation (v1):** bot restart while streamer is live re-initializes `wasLive=false`, so the first poll after restart will re-announce. Document in README — fine for a single-server bot. Postgres in a future change can fix it.

## Wire-up

In `src/index.ts`, after the existing `client.once(Events.ClientReady, ...)` block:

```ts
if (config.features.twitchAnnouncer) {
  client.once(Events.ClientReady, () => startTwitchAnnouncer(client));
}
```

## Config additions (`src/config.ts`)

Follow the existing pattern — use `required()` for secrets that must exist when the flag is on, plain `process.env.X ?? default` for optional values. Add a `twitch` block:

```ts
twitch: {
  clientId: process.env.TWITCH_CLIENT_ID,
  clientSecret: process.env.TWITCH_CLIENT_SECRET,
  streamerUsername: process.env.TWITCH_STREAMER_USERNAME,
  announceChannelId: process.env.TWITCH_ANNOUNCE_CHANNEL_ID,
  pollIntervalSeconds: Number(process.env.TWITCH_POLL_INTERVAL_SECONDS ?? '60'),
},
```

Validate inside `twitchAnnouncer.start()` — if the flag is on but secrets are missing, throw a clear error there. Keeps the config module free of flag-aware branching.

## Env vars

- `FF_TWITCH_ANNOUNCER` — `true` to enable.
- `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET` — from `https://dev.twitch.tv/console/apps`.
- `TWITCH_STREAMER_USERNAME` — login name (lowercased), not display name.
- `TWITCH_ANNOUNCE_CHANNEL_ID` — Discord channel ID. Enable Developer Mode in Discord, right-click channel → Copy ID.
- `TWITCH_POLL_INTERVAL_SECONDS` — default `60`. Don't go below 30 (Helix rate limits per token).

## What's already available

- **`axios`** (already a dep) for Helix calls.
- **`Cooldown`** from `src/utility/cooldown.ts` — probably not needed here (the poll interval already paces calls), but available if you want extra throttling.
- **`config`** module from `src/config.ts` — add a `twitch` block (see above).
- **`src/services/` / `src/utility/` split** convention from PR 3 — twitch.ts (HTTP, IO) goes in `services/`, any pure transition-detection logic could go in `utility/`.

## Critical files

- **New**: `src/services/twitch.ts`, `src/services/twitchAnnouncer.ts`
- Modify: `src/index.ts`, `src/config.ts`, `sample.env`, `README.md`

## Verification

- Flag off → no Twitch API calls (verify with logs / network sniff).
- Flag on with a known-offline streamer → no announcements; periodic poll log lines.
- Flag on, streamer goes live → single embed in target channel.
- Streamer goes offline then live again → second announcement (proves edge detection).
- Set poll interval to 10s for a quick test, then bump back to 60s for prod.
- Token refresh: hard to test without waiting ~1h; eyeball-verify the refresh logic and consider mocking `expires_in` for a unit test.

## Patch notes draft

```
v1.4 — <date>
Added FF_TWITCH_ANNOUNCER. When on, polls Twitch Helix every 60s and posts an embed to the configured channel when the streamer goes live.
```
