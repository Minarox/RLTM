// test/index.test.ts
import { describe, expect, it } from 'bun:test'
import { Elysia } from 'elysia'
import scoreboard from '../src/controllers/scoreboard.ts'
import app from '../src/extensions/app.ts'

describe('Scoreboard', () => {
    it('GET /:tournamentId/scoreboard (without tournamentId)', async (): Promise<void> => {
        const RLTM = new Elysia().use(app).use(scoreboard)

        const response: Response = await RLTM
            .handle(new Request('http://localhost/_not_a_tournament_id_/scoreboard', { method: 'GET' }))
            .then((res: Response) => res)

            expect(response.status).toBe(404)
            expect(await response.text()).toBe('NOT_FOUND')
    })
})
