// test/index.test.ts
import { describe, expect, it } from 'bun:test'
import { Elysia } from 'elysia'
import main from '../src/controllers/main.ts'
import app from '../src/extensions/app.ts'

describe('Main', () => {
    it('GET /:tournamentId (without tournamentId)', async (): Promise<void> => {
        const RLTM = new Elysia().use(app).use(main)

        const response: Response = await RLTM
            .handle(new Request('http://localhost/_not_a_tournament_id_', { method: 'GET' }))
            .then((res: Response) => res)

        expect(response.status).toBe(404)
        expect(await response.text()).toBe('NOT_FOUND')
    })
})
