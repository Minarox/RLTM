// test/index.test.ts
import { describe, expect, it } from 'bun:test'
import { Elysia } from 'elysia'
import app from '../src/extensions/app.ts'
import statistics from '../src/controllers/statistics.ts'

describe('Statistics', () => {
    it('GET /statistics/:tournamentId (without tournamentId)', async (): Promise<void> => {
        const RLTM = new Elysia().use(app).use(statistics)

        const response: Response = await RLTM
            .handle(new Request('http://localhost/statistics/_not_a_tournament_id_'))
            .then((res: Response) => res)

            expect(response.status).toBe(404)
            expect(await response.text()).toBe('NOT_FOUND')
    })
})
