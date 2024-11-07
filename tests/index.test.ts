import { describe, expect, test } from 'bun:test'
import { app } from "../src/index.ts"

describe('App', () => {
    test("Store", (): void => {
        expect(app.store.version).toBe("1.0.0")
        expect(app.store.plugin_version).toBe("1.0.0")
    })

    test('GET /version', async (): Promise<void> => {
        const response: Response = await app
            .handle(new Request('http://localhost/version', { method: 'GET' }))

        expect(await response.text()).toBe("1.0.0")
    })
})
