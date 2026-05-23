# PR 6 — Migrate from DigitalOcean to self-hosted Portainer

Light hardening of the existing Docker setup, then deploy as a Portainer compose stack. The bot is already stateless and the Dockerfile is production-ready (multi-stage, non-root, Alpine, ffmpeg installed, `NODE_ENV=production`), so this is mostly operational.

## Phase 1 — Graceful shutdown in `src/index.ts`

Portainer / `docker stop` sends SIGTERM with a default 10s grace period. Without a handler the WebSocket drops abruptly and the Twitch poll keeps an unref'd timer alive briefly. Add:

- `process.on('SIGTERM', shutdown)` and `process.on('SIGINT', shutdown)`
- Handler calls `twitchAnnouncer.stop()` (already exported at `src/services/twitchAnnouncer.ts:73`) when the flag is on, then `await client.destroy()`, then `process.exit(0)`
- Guard against double-fire with a `shuttingDown` flag

Music player's `discord-player` instance is torn down by `client.destroy()` — no extra step.

## Phase 2 — Compose hardening in `docker-compose.yml`

Add to the `bot` service:

- `stop_grace_period: 15s` — gives the SIGTERM handler room
- `deploy.resources.limits`: `cpus: "0.5"`, `memory: 512M` (music + ffmpeg is the heaviest path)
- `deploy.resources.reservations`: `memory: 128M`
- `logging.driver: json-file` with `max-size: 10m`, `max-file: "3"` — caps host disk usage

`deploy.resources` is honored by Compose v2 and Portainer stacks (no Swarm needed).

## Phase 3 — Portainer deployment

**Git-based stack (recommended).** Portainer → Stacks → Add stack → Repository:

1. Repo URL + compose path `docker-compose.yml`
2. Auth via SSH key or PAT if private
3. Set env vars via Portainer's per-stack env UI (don't commit `.env`)
4. Deploy

Required env vars (boot fails without): `DISCORD_TOKEN`, `APPLICATION_ID`, `OPENAI_API_KEY`.

Optional / feature-flagged: `FF_AI_PERSONALITY`, `FF_TWITCH_ANNOUNCER`, `FF_MUSIC`, plus their dependent vars (`TWITCH_*`, `AI_PERSONALITY_*`, etc.).

No volumes needed — `prompts/` and `media/` are baked into the image. Rebuild to change them.

## Phase 4 — Cutover

1. Boot the Portainer stack with all `FF_*` flags off
2. Confirm `I am ready! Logged in as <bot>` in Portainer logs
3. Stop the DigitalOcean container
4. Flip flags on one at a time (AI → Twitch → Music), exercise each in Discord
5. After 24h stable, decommission the DO droplet

A bot token can only be logged in from one process cleanly at a time; brief overlap is fine but expect reconnect churn. Prefer stopping DO first.

## Verification

- `docker compose config` locally before pushing (validates the new `deploy` / `logging` blocks)
- Portainer logs show ready line within ~10s of stack-up
- `docker stop discord-octobot` → logs show `Received SIGTERM, shutting down...` and exit before grace period
- `docker stats` confirms memory well under 512M cap
- Run `/ping` in Discord → confirms gateway + interactions
- With `FF_MUSIC=true`: `/play <track>` → confirms ffmpeg wired up
