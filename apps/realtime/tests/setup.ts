// Preloaded by bun test (bunfig.toml): the tests use their own database
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const path = join(tmpdir(), `rltm-test-${process.pid}.db`);
["", "-shm", "-wal"].forEach((suffix) => rmSync(`${path}${suffix}`, { force: true }));

process.env['DATABASE_URL'] = path;
process.env['NODE_ENV'] = "test";
process.env['RLTM_ADMIN_TOKEN'] = "ADMIN-TOKEN";
process.env['REPLAYS_DIR'] = join(tmpdir(), `rltm-test-replays-${process.pid}`);
process.env['REPLAY_MAX_SIZE'] = String(1024 * 1024);
rmSync(process.env['REPLAYS_DIR'], { recursive: true, force: true });

const { arena, db, player, season, slot, team, tournament, versus } = await import("@rltm/db");

db.insert(arena).values({ code: "Stadium_P", name: "DFH Stadium" }).run();
db.insert(tournament).values([
    { id: "DEFAULT", name: "Default tournament" },
    { id: "OTHER", name: "Other tournament" }
]).run();
db.insert(season).values({ id: 1, tournamentId: "DEFAULT", name: "Season", startAt: "2000-01-01", endAt: "2099-12-31" }).run();
db.insert(player).values([
    { id: 1, uid: "Steam|76561198000000001|0", name: "Player1" },
    { id: 2, uid: "Steam|76561198000000002|0", name: "Player2" }
]).run();
db.insert(team).values([
    { id: 1, seasonId: 1, name: "Team A", players: [2] },
    { id: 2, seasonId: 1, name: "Team B", players: [1] },
    { id: 3, seasonId: 1, name: "Team C", players: [] },
    { id: 4, seasonId: 1, name: "Team D", players: [] }
]).run();
db.insert(versus).values([
    { id: 1, seasonId: 1, team1Id: 1, team2Id: 2 },
    { id: 2, seasonId: 1, team1Id: 3, team2Id: 4 },
    { id: 3, seasonId: 1, team1Id: 1, team2Id: 3 }
]).run();
db.insert(slot).values([
    { id: "DEFAULT", tournamentId: "DEFAULT", name: "Stream", token: "TOKEN-DEFAULT", versusId: 1 },
    { id: "SECOND", tournamentId: "DEFAULT", name: "Slot 2", token: "TOKEN-SECOND", versusId: 2 },
    { id: "DISABLED", tournamentId: "DEFAULT", name: "Disabled", token: "TOKEN-DISABLED", enabled: false },
    { id: "OTHERSLOT", tournamentId: "OTHER", name: "Other", token: "TOKEN-OTHER" }
]).run();
