import { describe, expect, test } from 'bun:test'
import { app } from "../src/index.ts"

describe('Overlay', () => {
    test('GET /:tournamentId/overlay (without tournamentId)', async (): Promise<void> => {
        const response: Response = await app
            .handle(new Request('http://localhost/_not_a_tournament_id_/overlay', { method: 'GET' }))

        expect(response.status).toBe(404)
        expect(await response.text()).toBe('NOT_FOUND')
    })

    test('GET /:tournamentId/overlay', async (): Promise<void> => {
        const response: Response = await app
            .handle(new Request('http://localhost/DEFAULT/overlay', { method: 'GET' }))

        expect(response.status).toBe(200)
    })
})
