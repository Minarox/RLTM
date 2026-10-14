import { describe, expect, test } from 'bun:test'
import { saveMatchResult } from "@rltm/db"
import { app } from "../src/index.ts"

// Start of a replay file: header size, CRC, versions, then the class of the replay
function replayFile(size: number = 2048): Uint8Array {
    const data = new Uint8Array(size)
    data.set(new TextEncoder().encode("TAGame.Replay_Soccar_TA"), 24)
    data[size - 1] = 42
    return data
}

const upload = (guid: string, body: Uint8Array | string, token: string | null = 'TOKEN-DEFAULT') => app.handle(new Request(
    `http://localhost/api/replays/${guid}`,
    { method: 'PUT', body: body as BodyInit, headers: { 'Content-Type': 'application/octet-stream', ...(token ? { Authorization: `Bearer ${token}` } : {}) } }
))

const download = (tournamentId: string, guid: string) => app.handle(new Request(`http://localhost/${tournamentId}/matches/${guid}/replay`))

const result = (guid: string) => ({
    guid, client: "PC", endedAt: Date.now(), arenaCode: "Stadium_P", duration: 300, timePlayed: 300, isOvertime: false,
    score: [1, 0], winner: 0, mvp: null, teams: [], scoreboard: {}, stats: null, replayName: null
})

describe('Replays', () => {
    test('Upload refused', async (): Promise<void> => {
        expect((await upload("REPLAY-1", replayFile(), null)).status).toBe(401)
        expect((await upload("REPLAY-1", replayFile(), 'TOKEN-DISABLED')).status).toBe(401)
        expect((await upload("REPLAY.1", replayFile())).status).toBe(400)
        expect((await upload("REPLAY-1", "not a replay file")).status).toBe(415)
        expect((await upload("REPLAY-1", replayFile(1024 * 1024 + 1))).status).toBe(413)
    })

    test('Upload and download of the replay of a match', async (): Promise<void> => {
        // The replay can arrive before the result of the match
        const file = replayFile()
        const response = await upload("REPLAY-2", file)
        expect(response.status).toBe(201)
        expect(await response.json()).toEqual({ guid: "REPLAY-2", size: file.length })

        // Downloaded once the match is saved, only from its tournament
        expect((await download("DEFAULT", "REPLAY-2")).status).toBe(404)
        saveMatchResult(result("REPLAY-2"), 3, [])

        const downloaded = await download("DEFAULT", "REPLAY-2")
        expect(downloaded.status).toBe(200)
        expect(downloaded.headers.get('content-disposition')).toBe('attachment; filename="REPLAY-2.replay"')
        expect(Array.from(new Uint8Array(await downloaded.arrayBuffer()))).toEqual(Array.from(file))
        expect((await download("OTHER", "REPLAY-2")).status).toBe(404)

        // Sent again (retry): replaced
        expect((await upload("REPLAY-2", replayFile(4096))).status).toBe(201)
        expect((await (await download("DEFAULT", "REPLAY-2")).arrayBuffer()).byteLength).toBe(4096)

        // A slot of another tournament can't replace it
        expect((await upload("REPLAY-2", replayFile(), 'TOKEN-OTHER')).status).toBe(403)
    })
})
