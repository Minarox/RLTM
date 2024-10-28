// test/index.test.ts
import { describe, expect, it } from 'bun:test'
import { Elysia } from 'elysia'
import overlay from '../src/controllers/overlay.ts'
import app from '../src/extensions/app.ts'

describe('Overlay', () => {
    it('GET /:tournamentId/overlay (without tournamentId)', async (): Promise<void> => {
        const RLTM = new Elysia().use(app).use(overlay)

        const response: Response = await RLTM
            .handle(new Request('http://localhost/_not_a_tournament_id_/overlay', { method: 'GET' }))
            .then((res: Response) => res)

            expect(response.status).toBe(404)
            expect(await response.text()).toBe('NOT_FOUND')
    })
})
