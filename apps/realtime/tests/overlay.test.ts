import { describe, expect, test } from 'bun:test'
import { app } from "../src/index.ts"

describe('Overlay', () => {
    test('GET /:tournamentId/:slotId/overlay (without tournamentId)', async (): Promise<void> => {
        const response: Response = await app
            .handle(new Request('http://localhost/_not_a_tournament_id_/DEFAULT/overlay', { method: 'GET' }))

        expect(response.status).toBe(404)
        expect(await response.text()).toBe('NOT_FOUND')
    })

    test('GET /:tournamentId/:slotId/overlay', async (): Promise<void> => {
        const response: Response = await app
            .handle(new Request('http://localhost/DEFAULT/DEFAULT/overlay', { method: 'GET' }))

        expect(response.status).toBe(200)
    })

    test('GET /:tournamentId/:slotId/overlay (slot not in the tournament)', async (): Promise<void> => {
        for (const path of ['DEFAULT/_not_a_slot_id_', 'DEFAULT/OTHERSLOT', 'DEFAULT/DISABLED']) {
            const response: Response = await app
                .handle(new Request(`http://localhost/${path}/overlay`, { method: 'GET' }))

            expect(response.status).toBe(404)
        }
    })
})
