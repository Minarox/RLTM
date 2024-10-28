// test/index.test.ts
import { describe, expect, it } from 'bun:test'
import { Elysia } from 'elysia'
import versus from '../src/controllers/versus.ts'
import app from '../src/extensions/app.ts'

describe('Versus', () => {
    it('GET /:tournamentId/versus (without tournamentId)', async (): Promise<void> => {
        const RLTM = new Elysia().use(app).use(versus)

        const response: Response = await RLTM
            .handle(new Request('http://localhost/_not_a_tournament_id_/versus', { method: 'GET' }))
            .then((res: Response) => res)

            expect(response.status).toBe(404)
            expect(await response.text()).toBe('NOT_FOUND')
    })
})
