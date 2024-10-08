// test/index.test.ts
import { describe, expect, it } from 'bun:test'
import { Elysia } from 'elysia'
import app from '../src/extensions/app.ts'

describe('Index', () => {
    it('GET /version', async (): Promise<void> => {
        const RLTM = new Elysia().use(app).get('/version', ({ store }) => store.version)

        const response: string = await RLTM
            .handle(new Request('http://localhost/version', { method: 'GET' }))
            .then((res: Response) => res.text())

        expect(response).toBe(process.env['npm_package_version'] as string)
    })
})
