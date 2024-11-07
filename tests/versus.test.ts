import { describe, expect, test } from 'bun:test'
import { app } from "../src/index.ts"

describe('Versus', () => {
    test('GET /:tournamentId/versus (without tournamentId)', async (): Promise<void> => {
        const response: Response = await app
            .handle(new Request('http://localhost/_not_a_tournament_id_/versus', { method: 'GET' }))

        expect(response.status).toBe(404)
        expect(await response.text()).toBe('NOT_FOUND')
    })

    test('GET /:tournamentId/versus', async (): Promise<void> => {
        const response: Response = await app
            .handle(new Request('http://localhost/DEFAULT/versus', { method: 'GET' }))

        expect(response.status).toBe(200)
    })
})
