# OctoBot

Discord bot for my personal server.

## Features

- Adds `-poo` to the end of new users' nicknames. (Server theme: toilet paper.)
- Responds to certain emojis with another emoji.
- Tells a your-momma joke whenever the word "mom" (and variants) appears.
- `/chatgpt` slash command — prompts OpenAI.
- Kicks Joel whenever he types in chat (configurable via env var).

## Feature flags

Each opt-in feature is toggled via env var. `true` enables, anything else (or unset) disables.

| Flag                  | Default | Description                                          |
| --------------------- | ------- | ---------------------------------------------------- |
| `FF_AI_PERSONALITY`   | `false` | Bot replies to @mentions/replies with an AI persona. |
| `FF_TWITCH_ANNOUNCER` | `false` | Announce when a Twitch streamer goes live.          |
| `FF_MUSIC`            | `false` | Voice channel music playback.                       |

The AI personality's system prompt is loaded from `prompts/ai-personality.md`. Edit that file to tune the persona (no redeploy needed for local dev; rebuild image for Docker).

Each flag's implementation lands in its own PR (see `todo/`).

## Setup (local)

```sh
# Volta picks up the pinned Node version automatically
npm install
cp sample.env .env   # fill in DISCORD_TOKEN, APPLICATION_ID, OPENAI_API_KEY
npm run dev
```

Scripts:

- `npm run dev` — `tsx watch` (no build step, reloads on change)
- `npm run build` — compile to `dist/`
- `npm start` — run the compiled bot from `dist/`
- `npm run typecheck` — TS noEmit check
- `npm test` — vitest

## Docker

The bot ships with a multi-stage Alpine `Dockerfile` and `docker-compose.yml`:

```sh
cp sample.env .env   # fill in secrets
docker compose up -d --build
docker compose logs -f bot
```

## Roadmap

See `todo/` for the active modernization + feature plan. Items still on the wish list past that:

- [ ] Persist state in Postgres (Supabase).
- [ ] Frontend dashboard for managing config without env vars.

## Patch notes

### v1.3 — 2026-05-21
- Added `FF_AI_PERSONALITY` — when on, the bot replies to @mentions and replies-to-bot with an AI persona via OpenAI. System prompt is editable at `prompts/ai-personality.md`. Per-user cooldown (default 10s) reacts with ⏳ instead of replying when rate-limited.
- Renamed feature flag prefix from `FEATURE_*` to `FF_*`.

### v1.2 — 2026-05-21
- Containerized with a multi-stage Alpine Dockerfile + `docker-compose.yml`.

### v1.1 — 2026-05-21
- Updated `discord.js` to current `14.x`, `openai` to `v6`, `typescript` to `v6`.
- Rewrote OpenAI integration to use the v4+ SDK shape (`client.chat.completions.create`).
- Removed dead deps: `@discordjs/builders`, `@discordjs/core`, `ts-loader`, `source-map-loader`, `ts-node`, `ts-node-dev`, `nodemon`, `eslint`, unused `express`/`@types/express`.
- Fixed: unawaited async command execution, reply-after-defer mismatch, deprecated `ephemeral: true`.
- Added: typed `config` module with feature flags, OpenAI service for reuse, vitest test setup.
- Re-enabled Joel-kick (env-configurable).
- Deleted unused `src/server.ts`.

### v1.0 — 2023-07-07
- Refactored to TypeScript. No feature additions, minor optimizations.
