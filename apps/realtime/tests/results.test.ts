import { describe, expect, test } from 'bun:test'
import { app } from "../src/index.ts"

describe('Results', () => {
    test('GET /:tournamentId/results (without tournamentId)', async (): Promise<void> => {
        const response: Response = await app
            .handle(new Request('http://localhost/_not_a_tournament_id_/results', { method: 'GET' }))

        expect(response.status).toBe(404)
        expect(await response.text()).toBe('NOT_FOUND')
    })

    test('GET /:tournamentId/results', async (): Promise<void> => {
        const response: Response = await app
            .handle(new Request('http://localhost/DEFAULT/results', { method: 'GET' }))

        expect(response.status).toBe(200)
    })

    test('GET /:tournamentId/scoreboard (without tournamentId)', async (): Promise<void> => {
        const response: Response = await app
            .handle(new Request('http://localhost/_not_a_tournament_id_/scoreboard', { method: 'GET' }))

        expect(response.status).toBe(404)
        expect(await response.text()).toBe('NOT_FOUND')
    })

    test('GET /:tournamentId/scoreboard', async (): Promise<void> => {
        const response: Response = await app
            .handle(new Request('http://localhost/DEFAULT/scoreboard', { method: 'GET' }))

        expect(response.status).toBe(200)
    })

    test('GET /:tournamentId/slider (without tournamentId)', async (): Promise<void> => {
        const response: Response = await app
            .handle(new Request('http://localhost/_not_a_tournament_id_/slider', { method: 'GET' }))

        expect(response.status).toBe(404)
        expect(await response.text()).toBe('NOT_FOUND')
    })

    test('GET /:tournamentId/slider', async (): Promise<void> => {
        const response: Response = await app
            .handle(new Request('http://localhost/DEFAULT/slider', { method: 'GET' }))

        expect(response.status).toBe(200)
    })
})
