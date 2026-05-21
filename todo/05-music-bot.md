# PR 5 — Music Bot (feature-flagged)

Voice channel music playback via slash commands. The biggest PR — recommend doing it last.

## Toggle

`FF_MUSIC=true`

## Library choice

Use **`discord-player`** — handles YouTube/Spotify/SoundCloud extraction, queueing, voice connection, controls. Modern, actively maintained.

Avoid the trap of bare `@discordjs/voice` + standalone YT libs — those break constantly when YouTube changes their player.

Peer deps to install alongside: `@discordjs/voice`, plus an extractor (`@discord-player/extractor` or current equivalent — check the discord-player docs at install time).

## Intent change

Add `GatewayIntentBits.GuildVoiceStates` to `src/Client.ts`. Always-on is fine — it's harmless when the music FF is off.

## New slash commands

Under `src/slashCommands/music/`:

- `play.ts` — `/play query:<url-or-search>`. Joins user's voice channel, queues the track.
- `skip.ts` — `/skip`
- `queue.ts` — `/queue` shows current queue
- `stop.ts` — `/stop` clears queue and disconnects
- `pause.ts`, `resume.ts`

Each command's `command:` field uses `SlashCommandBuilder` (or its `OptionsOnly`/`SubcommandsOnly` subtype) — the `SlashCommand` interface accepts `SharedSlashCommand`.

## New service: `src/services/musicPlayer.ts`

- Singleton `Player` instance from `discord-player`.
- Lazy-init only when flag on (same pattern as `getSystemPrompt()` in `aiPersonality.ts`).
- Event listeners for `playerStart`, `audioTrackAdd`, `error` — log and surface user-friendly messages in the channel.

## Conditional command loading

`src/Client.ts`'s `loadAllCommands` currently `readdirSync`s `this.commandsPath` and dynamically imports every `.ts`/`.js` file. To skip music when the FF is off:

```ts
// inside loadAllCommands, before the readdirSync
const files = readdirSync(this.commandsPath).filter(/* ... */);
// ...
for (const file of files) { ... }
```

If music commands live in `src/slashCommands/music/`, extend the loader to walk that subdir only when `config.features.music`. Simplest implementation: do a second `readdirSync` of `music/` inside the conditional.

This keeps Discord's command list clean — when music is off, `/play` doesn't even appear (no "command failed" UX leak).

## Docker considerations (Alpine)

The current `Dockerfile` uses `node:24-alpine`. Music extractors typically need:

- `ffmpeg` — install via `RUN apk add --no-cache ffmpeg` in the runtime stage.
- Possibly `python3` and build tools for native compilation of some extractors. Add via `apk add` if discord-player's install fails.

Check the discord-player install logs once installed. Image size will grow ~50–100MB.

## Env vars

- `FF_MUSIC` — `true` to enable.

(No other env vars expected. If `discord-player` requires API keys for a Spotify extractor, add them here.)

## What's already available

- **`SharedSlashCommand` type** from `discord.js` — already used in `src/@types/types.d.ts`.
- **Loader pattern** in `src/Client.ts` — supports adding commands without touching the loader, as long as they live under `src/slashCommands/`.
- **`config` module** with feature flags from PR 1.
- **`services/` / `utility/` split** convention from PR 3.

## Critical files

- **New**: `src/slashCommands/music/{play,skip,queue,stop,pause,resume}.ts`
- **New**: `src/services/musicPlayer.ts`
- Modify: `src/Client.ts` — voice intent, conditional music-dir loading
- Modify: `package.json` — add `discord-player`, `@discordjs/voice`, extractor
- Modify: `Dockerfile` — `apk add ffmpeg`
- Modify: `sample.env`, `README.md`

## Verification

- Flag off → music commands not registered with Discord (`/play` doesn't appear in the slash command picker).
- Flag on, deploy → `/play` appears.
- `/play <youtube-url>` while in a voice channel → bot joins, plays audio.
- `/play` outside a voice channel → friendly error message.
- `/queue` shows the queued track(s).
- `/skip` advances; `/pause` + `/resume` work; `/stop` clears + disconnects.
- Queue empties → bot leaves the voice channel cleanly (no zombie connections).
- Docker: verify ffmpeg is present in the runtime image (`docker compose exec bot ffmpeg -version`).

## Patch notes draft

```
v1.5 — <date>
Added FF_MUSIC. When on, voice-channel music via discord-player. Slash commands: /play /skip /queue /stop /pause /resume.
```
