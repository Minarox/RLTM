import { afterEach, describe, expect, test } from 'bun:test'
import { app } from "../src/index.ts"
import { getSlotLive } from "../src/live/store.ts"
import { goalMessage, playersMessage, pluginMessage, scoreboardMessage, spectatorMessage } from "./fixtures/plugin.ts"
import { closeSockets, connect, connectOverlay, connectPlugin, sleep } from "./helpers.ts"

const slot = () => getSlotLive('DEFAULT', 'DEFAULT')!

describe('Plugin', () => {
    afterEach(closeSockets)

    test('GET /:tournamentId (without tournamentId)', async (): Promise<void> => {
        const response: Response = await app
            .handle(new Request('http://localhost/_not_a_tournament_id_', { method: 'GET' }))

        expect(response.status).toBe(404)
        expect(await response.text()).toBe('NOT_FOUND')
    })

    test('Connection refused without a valid token', async (): Promise<void> => {
        await expect(connect('ws://localhost:3300/?token=_not_a_token_')).rejects.toThrow()
        await expect(connect('ws://localhost:3300/')).rejects.toThrow()
        // Token of a disabled slot
        await expect(connectPlugin('TOKEN-DISABLED')).rejects.toThrow()
    })

    test('Connection with the Authorization header', async (): Promise<void> => {
        const plugin = await connect('ws://localhost:3300/', { headers: { Authorization: `Bearer TOKEN-DEFAULT` } })
        expect(plugin.ws.readyState).toBe(WebSocket.OPEN)
    })

    test('States and events published to the overlays', async (): Promise<void> => {
        const overlay = await connectOverlay()
        const plugin = await connectPlugin()

        plugin.send(pluginMessage)
        expect((await overlay.waitFor((message) => message.plugin)).plugin).toEqual(pluginMessage.payload)

        plugin.send(playersMessage)
        expect((await overlay.waitFor((message) => message.players)).players).toEqual(playersMessage.payload)

        plugin.send(scoreboardMessage)
        expect((await overlay.waitFor((message) => message.scoreboard)).scoreboard).toEqual(scoreboardMessage.payload)

        plugin.send(spectatorMessage)
        expect((await overlay.waitFor((message) => message.spectator)).spectator).toEqual(spectatorMessage.payload)

        plugin.send(goalMessage)
        expect((await overlay.waitFor((message) => message.event)).event).toEqual(goalMessage.payload)

        // A null payload clears the state
        overlay.messages.length = 0
        plugin.send({ topic: "spectator", payload: null })
        await overlay.waitFor((message) => 'spectator' in message && message.spectator === null)
        expect(slot().spectator).toBeNull()

        // States are sent to the overlays connected later
        const lateOverlay = await connectOverlay()
        expect((await lateOverlay.waitFor((message) => message.players)).players).toEqual(playersMessage.payload)

        // RLTM doesn't send anything that isn't a command to the plugin
        await sleep(50)
        expect(plugin.messages).toEqual([])
    })

    test('States cleared when the plugin disconnects', async (): Promise<void> => {
        const plugin = await connectPlugin()
        plugin.send(pluginMessage)
        plugin.send(playersMessage)

        const overlay = await connectOverlay()
        await overlay.waitFor((message) => message.players)

        overlay.messages.length = 0
        plugin.ws.close()
        await overlay.waitFor((message) => 'players' in message && message.players === null)
        await overlay.waitFor((message) => 'plugin' in message && message.plugin === null)
        expect(slot().pluginConnectionId).toBeNull()
    })

    test('Messages of a plugin older than the protocol 2 ignored', async (): Promise<void> => {
        const plugin = await connectPlugin()
        const overlay = await connectOverlay()

        plugin.send(playersMessage)
        await sleep(100)
        expect(overlay.messages.some((message) => message.players)).toBe(false)

        plugin.send({ ...pluginMessage, payload: { ...pluginMessage.payload, protocol: 1 } })
        plugin.send(playersMessage)
        await sleep(100)
        expect(overlay.messages.some((message) => message.players)).toBe(false)
        expect(slot().plugin).toBeNull()
    })

    test('Messages of a replaced plugin ignored', async (): Promise<void> => {
        const oldPlugin = await connectPlugin()
        oldPlugin.send(pluginMessage)

        const plugin = await connectPlugin()
        plugin.send(pluginMessage)

        const overlay = await connectOverlay()
        oldPlugin.send(playersMessage)
        await sleep(100)
        expect(overlay.messages.some((message) => message.players)).toBe(false)

        plugin.send(playersMessage)
        await overlay.waitFor((message) => message.players)
    })
})
