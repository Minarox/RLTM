import { describe, expect, test } from 'bun:test'
import { app } from "../src/index.ts"

describe('Plugin', () => {
    test('GET /:tournamentId (without tournamentId)', async (): Promise<void> => {
        const response: Response = await app
            .handle(new Request('http://localhost/_not_a_tournament_id_', { method: 'GET' }))

        expect(response.status).toBe(404)
        expect(await response.text()).toBe('NOT_FOUND')
    })
})
