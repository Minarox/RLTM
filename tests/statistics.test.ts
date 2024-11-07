import { describe, expect, test } from 'bun:test'
import { app } from "../src/index.ts"

describe('Statistics', () => {
    test('GET /:tournamentId/statistics (without tournamentId)', async (): Promise<void> => {
        const responseNotFound: Response = await app
            .handle(new Request('http://localhost/_not_a_tournament_id_/statistics', { method: 'GET' }))

        expect(responseNotFound.status).toBe(404)
        expect(await responseNotFound.text()).toBe('NOT_FOUND')
    })

    test('GET /:tournamentId/statistics', async (): Promise<void> => {
        const response: Response = await app
            .handle(new Request('http://localhost/DEFAULT/statistics', { method: 'GET' }))

        expect(response.status).toBe(200)
    })
})
