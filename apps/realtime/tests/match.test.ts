import { describe, expect, test } from 'bun:test'
import { db, match, saveMatchResult } from "@rltm/db"
import { eq } from "drizzle-orm"

const result = (guid: string | null, score: number[]) => ({
    guid, client: "PC", endedAt: Date.now(), arenaCode: "Stadium_P", duration: 300, timePlayed: 300, isOvertime: false,
    score, winner: 0, mvp: null, teams: [], scoreboard: {}, stats: null, replayName: null
})

describe('Match', () => {
    test('A match of the game is saved once', (): void => {
        const first = saveMatchResult(result("UNIQUE-GAME", [1, 0]), 2, [])
        // Received again for another versus (the versus of the slot changed during the match): the same match is updated
        const second = saveMatchResult(result("UNIQUE-GAME", [3, 0]), 3, [])

        expect(second.id).toBe(first.id)
        expect([second.versusId, second.scoreTeam1]).toEqual([3, 3])
        expect(db.select().from(match).where(eq(match.guid, "UNIQUE-GAME")).all().length).toBe(1)

        // Enforced by the database
        expect(() => db.insert(match).values({ versusId: 2, guid: "UNIQUE-GAME", arenaCode: "Stadium_P" }).run()).toThrow()
    })

    test('Matches without guid (offline) are all saved', (): void => {
        const first = saveMatchResult(result(null, [1, 0]), 2, [])
        const second = saveMatchResult(result(null, [1, 0]), 2, [])
        expect(second.id).not.toBe(first.id)
    })
})
