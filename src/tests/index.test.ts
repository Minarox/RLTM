// test/index.test.ts
import { describe, expect, it } from 'bun:test'
import { Elysia } from 'elysia'

describe('Elysia', () => {
    it('return a response', async (): Promise<void> => {
        const app: Elysia = new Elysia().get('/', (): string => 'Hello Elysia')

        const response: string = await app
            .handle(new Request('http://localhost/'))
            .then((res: Response) => res.text())

        expect(response).toBe('Hello Elysia')
    })
})
