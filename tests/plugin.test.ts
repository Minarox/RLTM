// test/index.test.ts
import { describe, expect, it } from 'bun:test'
import { Elysia } from 'elysia'
import plugin from '../src/controllers/plugin.ts'
import app from '../src/extensions/app.ts'

describe('Plugin', () => {
    it('GET /:tournamentId (without tournamentId)', async (): Promise<void> => {
        const RLTM = new Elysia().use(app).use(plugin)

        const response: Response = await RLTM
            .handle(new Request('http://localhost/_not_a_tournament_id_', { method: 'GET' }))
            .then((res: Response) => res)

        expect(response.status).toBe(404)
        expect(await response.text()).toBe('NOT_FOUND')
    })
})
