# RLTM
Rocket League Tournament Manager

## Structure
RLTM is a [Bun workspace](https://bun.sh/docs/install/workspaces):

```
apps/
  realtime/     Elysia server: plugin WebSocket, overlays (pages, styles, assets), live store
packages/
  db/           Drizzle schemas, migrations, seeders, queries and scoring (SQLite)
  shared/       Topics (and their pub/sub names) and messages of the plugin, shared by the apps
```

The database is `apps/realtime/sqlite.db` by default, or the path of the `DATABASE_URL` environment variable (relative to the working directory).

## Development
From the root of the repository:

```bash
bun install
bun run db:seed     # Arenas, cars, default tournament, season and slot
bun run dev         # http://localhost:3300
bun test            # Uses its own temporary database (apps/realtime/tests/setup.ts)
bun run typecheck
bun run build && bun run start
```

`bun run db:migrate` generates a migration after a change of the schemas of `packages/db`. Migrations are applied when the server starts.

## Dependencies
- [Bun](https://bun.sh/)
- [Elysia](https://elysiajs.com/)
    - [Cron](https://elysiajs.com/plugins/cron)
    - [Static](https://elysiajs.com/plugins/static)
- [Drizzle](https://orm.drizzle.team/)
- [Winston](https://github.com/winstonjs/winston)
    - [Colors](https://github.com/Marak/colors.js)

## Slots
A **slot** is a broadcast post of a tournament: a game PC with its plugin, and its OBS scene with its overlays. A tournament has as many slots as matches broadcast at the same time. Each slot has:

- its own **plugin token**,
- the **versus** it shows, assigned by the organizer (`versusId`), and the matches of this versus,
- its own overlays.

The default slot of a tournament created before the slots has the id of the tournament and kept the token of the tournament: plugins already configured keep working.

### Overlays

| Overlay | URL |
|---|---|
| Match (scoreboard, boost) | `/<tournament>/<slot>/overlay` |
| Statistics of the match | `/<tournament>/<slot>/statistics` |
| Versus | `/<tournament>/<slot>/versus` |
| Results of the tournament | `/<tournament>/results`, `/<tournament>/scoreboard`, `/<tournament>/slider` |

The background of the overlays is transparent, in OBS as in a browser.

### Administration API
The slots are managed with the API, under `/api/tournaments/<tournament>/slots`. Until the accounts of the organizers, the API needs the token of the `RLTM_ADMIN_TOKEN` environment variable in the `Authorization: Bearer <token>` header: it is disabled (403) without it.

| Request | Body | |
|---|---|---|
| `GET /` | | Slots of the tournament, with their token and `connected` (plugin connected) |
| `POST /` | `{ name, versusId?, enabled? }` | Create a slot |
| `PATCH /<slot>` | `{ name?, versusId?, enabled? }` | Rename, enable or disable, assign a versus (`null` to remove it) |
| `POST /<slot>/regenerate-token` | | New token, the connected plugin is disconnected |
| `DELETE /<slot>` | | Delete the slot, its plugin is disconnected |

A versus is shown by one slot at most: assigning a versus already assigned to another slot (enabled or not) is refused with `422 VERSUS_ALREADY_ASSIGNED`. The overlays of the slot are updated at once. The type of the application is exported (`type App` of `apps/realtime/src/index.ts`) for [Eden Treaty](https://elysiajs.com/eden/treaty/overview).

To get the token of a slot:

```bash
curl -H "Authorization: Bearer $RLTM_ADMIN_TOKEN" http://localhost:3300/api/tournaments/<tournament>/slots
```

### Environment variables

| Variable | Default | |
|---|---|---|
| `DATABASE_URL` | `apps/realtime/sqlite.db` | SQLite database, relative to the working directory |
| `RLTM_ADMIN_TOKEN` | | Token of the administration API, disabled without it |
| `ENTITIES_INTERVAL` | `33` | Minimum interval in ms between two `entities` messages published to the overlays of a slot (~30 Hz) |

## Game plugin
RLTM receives the data of the game from the BakkesMod plugin [RLTM Bridge](https://github.com/Minarox/RLTM-Bridge), protocol 2 (RLTM Bridge 1.1.0 or later).

In the settings of the plugin, set the server URL to `ws://<RLTM address>:3300/?token=<slot token>`. The token can also be set in the *Token* setting of the plugin (`Authorization` header) instead of the URL. One game is connected to each slot: a new connection with the same token replaces the previous one. Several games can be connected to the same tournament with the tokens of different slots.

- During a game, the match and the statistics shown by the overlays come from the plugin and are kept in memory: nothing is written in the database. The match and the statistics of the players are saved at the end of the game, from the `result` message, in one transaction, in the versus of the slot. The result is saved once per game, identified by its `guid` (the plugin sends it again on each connection until the end of the next game).
- The replay of each game is named with the teams of the versus and the number of the game (`set_replay_name` command). The teams are placed on the blue and orange sides from the players of each side.
- The overlays of the slot receive the states of the plugin (`plugin`, `players`, `scoreboard`, `stats`, `spectator`, `entities`, `null` when the game disconnects) and its events (`statistic`, `event`, `result`).
