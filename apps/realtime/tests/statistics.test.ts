import { describe, expect, test } from 'bun:test'
import { app } from "../src/index.ts"

describe('Statistics', () => {
    test('GET /:tournamentId/:slotId/statistics (without tournamentId)', async (): Promise<void> => {
        const responseNotFound: Response = await app
            .handle(new Request('http://localhost/_not_a_tournament_id_/DEFAULT/statistics', { method: 'GET' }))

        expect(responseNotFound.status).toBe(404)
        expect(await responseNotFound.text()).toBe('NOT_FOUND')
    })

    test('GET /:tournamentId/:slotId/statistics', async (): Promise<void> => {
        const response: Response = await app
            .handle(new Request('http://localhost/DEFAULT/DEFAULT/statistics', { method: 'GET' }))

        expect(response.status).toBe(200)
    })

    test('GET /:tournamentId/:slotId/statistics (slot not in the tournament)', async (): Promise<void> => {
        for (const path of ['DEFAULT/_not_a_slot_id_', 'DEFAULT/OTHERSLOT', 'DEFAULT/DISABLED']) {
            const response: Response = await app
                .handle(new Request(`http://localhost/${path}/statistics`, { method: 'GET' }))

            expect(response.status).toBe(404)
        }
    })
})
