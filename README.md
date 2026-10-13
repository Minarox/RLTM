# RLTM
Rocket League Tournament Manager

## Structure
RLTM is a [Bun workspace](https://bun.sh/docs/install/workspaces):

```
apps/
  realtime/     Elysia server: plugin WebSocket, overlays (pages, styles, assets), live store
packages/
  db/           Drizzle schemas, migrations, seeders, queries and scoring (SQLite)
  shared/       Topics and messages of the plugin, shared by the apps
```

The database is `apps/realtime/sqlite.db` by default, or the path of the `DATABASE_URL` environment variable (relative to the working directory).

## Development
From the root of the repository:

```bash
bun install
bun run db:seed     # Arenas, cars, default tournament and season
bun run dev         # http://localhost:3300
bun test            # NODE_ENV=test to hide the startup logs
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

## Game plugin
RLTM receives the data of the game from the BakkesMod plugin [RLTM Bridge](https://github.com/Minarox/RLTM-Bridge), protocol 2 (RLTM Bridge 1.1.0 or later).

In the settings of the plugin, set the server URL to `ws://<RLTM address>:3300/?token=<tournament token>`. The token can also be set in the *Token* setting of the plugin (`Authorization` header) instead of the URL. One game is connected to each tournament: a new connection replaces the previous one.

- The match, the scoreboard and the result of each game are saved in the current versus of the tournament. The final result is saved once per game, identified by its `guid`.
- The replay of each game is named with the teams of the versus and the number of the game (`set_replay_name` command). The teams are placed on the blue and orange sides from the players of each side.
- The overlays (`/<tournament>/overlay`) receive the states of the plugin (`plugin`, `players`, `scoreboard`, `stats`, `spectator`, `entities`, `null` when the game disconnects) and its events (`statistic`, `event`, `result`).
