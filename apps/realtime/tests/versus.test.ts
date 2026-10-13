import { describe, expect, test } from 'bun:test'
import { app } from "../src/index.ts"

describe('Versus', () => {
    test('GET /:tournamentId/:slotId/versus (without tournamentId)', async (): Promise<void> => {
        const response: Response = await app
            .handle(new Request('http://localhost/_not_a_tournament_id_/DEFAULT/versus', { method: 'GET' }))

        expect(response.status).toBe(404)
        expect(await response.text()).toBe('NOT_FOUND')
    })

    test('GET /:tournamentId/:slotId/versus', async (): Promise<void> => {
        const response: Response = await app
            .handle(new Request('http://localhost/DEFAULT/DEFAULT/versus', { method: 'GET' }))

        expect(response.status).toBe(200)
    })

    test('GET /:tournamentId/:slotId/versus (slot not in the tournament)', async (): Promise<void> => {
        for (const path of ['DEFAULT/_not_a_slot_id_', 'DEFAULT/OTHERSLOT', 'DEFAULT/DISABLED']) {
            const response: Response = await app
                .handle(new Request(`http://localhost/${path}/versus`, { method: 'GET' }))

            expect(response.status).toBe(404)
        }
    })
})
