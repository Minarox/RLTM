import { getTournamentIdOfMatch } from "@rltm/db";
import { Elysia, t } from "elysia";
import logger from "../extensions/logger.ts";
import { getSlotOfPlugin } from "../plugin/auth.ts";
import { getReplayFile, isReplayFile, isValidGuid, maxReplaySize, saveReplay } from "../replays.ts";

// Replay of a match, sent by the plugin of a slot at the end of the match (the WebSocket is only for the live data)
export const replayUpload = new Elysia({ name: "Replay upload" })
    .put("/api/replays/:guid", async ({ params, query, headers, request, status }) => {
        const slotLive = getSlotOfPlugin({ query, headers });
        if (!slotLive) return status(401, "UNAUTHORIZED");
        if (!isValidGuid(params.guid)) return status(400, "INVALID_GUID");

        const length = Number(headers['content-length']);
        if (length > maxReplaySize) return status(413, "REPLAY_TOO_LARGE");

        const data = new Uint8Array(await request.arrayBuffer());
        if (!data.length) return status(400, "EMPTY_REPLAY");
        if (data.length > maxReplaySize) return status(413, "REPLAY_TOO_LARGE");
        if (!isReplayFile(data)) return status(415, "NOT_A_REPLAY");

        // A saved match must be a match of the tournament of the slot. The replay can arrive before the result.
        const tournamentId = getTournamentIdOfMatch(params.guid);
        if (tournamentId && tournamentId !== slotLive.slot.tournamentId) return status(403, "MATCH_OF_ANOTHER_TOURNAMENT");

        await saveReplay(params.guid, data);
        logger.info(`🎞️ Replay of match ${params.guid} received from slot "${slotLive.slot.name}" (${Math.round(data.length / 1024)} KB).`);

        return status(201, { guid: params.guid, size: data.length });
    }, {
        params: t.Object({ guid: t.String() }),
        parse: "none"
    });

// Download of the replay of a match of the tournament (/:tournamentId/matches/:guid/replay)
export const replayDownload = new Elysia({ name: "Replay download" })
    .get("/replay", ({ params, status }) => {
        const { tournamentId, guid } = params as { tournamentId: string, guid: string };
        const file = isValidGuid(guid) && getTournamentIdOfMatch(guid) === tournamentId ? getReplayFile(guid) : undefined;
        if (!file) return status(404, "NOT_FOUND");

        return new Response(file, {
            headers: {
                "Content-Type": "application/octet-stream",
                "Content-Disposition": `attachment; filename="${guid}.replay"`
            }
        });
    });
