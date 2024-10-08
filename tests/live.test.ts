// test/index.test.ts
import { describe, expect, it } from 'bun:test'
import { Elysia } from 'elysia'
import live from '../src/controllers/live.ts'
import app from '../src/extensions/app.ts'

describe('Live', () => {
    it('GET /:tournamentId (without tournamentId)', async (): Promise<void> => {
        const RLTM = new Elysia().use(app).use(live)

        const response: Response = await RLTM
            .handle(new Request('http://localhost/_not_a_tournament_id_', { method: 'GET' }))
            .then((res: Response) => res)

        expect(response.status).toBe(404)
        expect(await response.text()).toBe('NOT_FOUND')
    })

    it('GET /live/:tournamentId (without tournamentId)', async (): Promise<void> => {
        const RLTM = new Elysia().use(app).use(live)

        const response: Response = await RLTM
            .handle(new Request('http://localhost/live/_not_a_tournament_id_'))
            .then((res: Response) => res)

            expect(response.status).toBe(404)
            expect(await response.text()).toBe('Not Found')
    })
})
