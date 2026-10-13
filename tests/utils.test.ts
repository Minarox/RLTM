import { describe, expect, test } from 'bun:test'
import { getGameNumber, getReplayNameCommand, getStatisticValues, getVersusSides, isSamePlayer } from "../src/utils/plugin.ts"
import { playersMessage, scoreboardPlayer } from "./fixtures/plugin.ts"

const versus: any = {
    id: 7,
    score: [1, 1],
    team1: { name: "Team A", players: [{ uid: "Steam|76561198000000002|0", name: "Player2", bot: false }] },
    team2: { name: "Team B", players: [{ uid: "Steam|76561198000000001|0", name: "Player1", bot: false }, 12] }
}

describe('Plugin utils', () => {
    test('Statistic values from the scoreboard', (): void => {
        const values = getStatisticValues(scoreboardPlayer as any)

        expect(values.score).toBe(320)
        expect(values.ballTouches).toBe(24)
        expect(values.demolish).toBe(2)
        expect(values.koDoubleKO).toBe(1)
        // Missing events are 0
        expect(values.epicSave).toBe(0)
        expect(values.koPlayerThrown).toBe(0)
    })

    test('Statistic values without events', (): void => {
        const values = getStatisticValues({ ...scoreboardPlayer, events: undefined } as any)

        expect(values.goals).toBe(1)
        expect(values.demolish).toBe(0)
    })

    test('Bots are identified by uid and name', (): void => {
        expect(isSamePlayer({ uid: "Unknown|0|0", name: "Bot A", bot: true }, { uid: "Unknown|0|0", name: "Bot B" })).toBe(false)
        expect(isSamePlayer({ uid: "Steam|1|0", name: "New name", bot: false }, { uid: "Steam|1|0", name: "Old name" })).toBe(true)
    })

    test('Teams of the versus placed on the sides of the game', (): void => {
        // Player1 (team B) plays blue, Player2 (team A) plays orange
        expect(getVersusSides(versus, playersMessage.payload)).toEqual({ blue: "Team B", orange: "Team A" })
        // Without players, team 1 is blue
        expect(getVersusSides(versus, null)).toEqual({ blue: "Team A", orange: "Team B" })
    })

    test('Game number of the versus', (): void => {
        expect(getGameNumber(versus)).toBe(3)
        expect(getGameNumber({ ...versus, score: undefined })).toBe(1)
        expect(getGameNumber({ ...versus, score: [60, 60] })).toBe(99)
    })

    test('set_replay_name command', (): void => {
        expect(getReplayNameCommand(versus, playersMessage.payload)).toEqual({
            command: "set_replay_name",
            payload: { blue: "Team B", orange: "Team A", game: 3 },
            id: "replay-7-3"
        })
        expect(getReplayNameCommand({ ...versus, team2: undefined }, null)).toBeNull()
    })
})
