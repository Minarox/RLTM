import { afterEach, describe, expect, test } from 'bun:test'
import { app } from "../src/index.ts"
import { entitiesInterval, getSlotLive } from "../src/live/store.ts"
import { matchMessage, playersMessage, pluginMessage } from "./fixtures/plugin.ts"
import { adminHeaders, closeSockets, connect, connectOverlay, connectPlugin, sleep } from "./helpers.ts"

const api = (path: string, init: RequestInit = {}) => app.handle(new Request(
    `http://localhost/api/tournaments/DEFAULT/slots${path}`,
    { ...init, headers: { ...adminHeaders, ...init.headers } }
))

const entities = (time: number) => ({ topic: "entities", payload: { time, balls: [], cars: [] } })

describe('Slots', () => {
    afterEach(closeSockets)

    test('Two slots of a tournament receive their own match', async (): Promise<void> => {
        const overlay1 = await connectOverlay('DEFAULT')
        const overlay2 = await connectOverlay('SECOND')
        const plugin1 = await connectPlugin('TOKEN-DEFAULT')
        const plugin2 = await connectPlugin('TOKEN-SECOND')

        // Both plugins stay connected: one plugin per slot
        plugin1.send(pluginMessage)
        plugin2.send(pluginMessage)
        plugin1.send(playersMessage)
        plugin1.send({ ...matchMessage, payload: { ...matchMessage.payload, guid: "SLOT-1-GAME", score: [1, 0] } })
        plugin2.send({ ...matchMessage, payload: { ...matchMessage.payload, guid: "SLOT-2-GAME", score: [0, 3] } })

        const match1 = (await overlay1.waitFor((message) => message.match?.guid === "SLOT-1-GAME")).match
        const match2 = (await overlay2.waitFor((message) => message.match?.guid === "SLOT-2-GAME")).match
        expect(match1.versusId).toBe(1)
        expect([match1.scoreTeam1, match1.scoreTeam2]).toEqual([1, 0])
        expect(match2.versusId).toBe(2)
        expect([match2.scoreTeam1, match2.scoreTeam2]).toEqual([0, 3])

        await sleep(100)
        expect(overlay1.messages.some((message) => message.match?.guid === "SLOT-2-GAME")).toBe(false)
        expect(overlay2.messages.some((message) => message.match?.guid === "SLOT-1-GAME")).toBe(false)
        expect(overlay2.messages.some((message) => message.players)).toBe(false)
        expect(getSlotLive('DEFAULT', 'DEFAULT')!.pluginConnectionId).not.toBeNull()
        expect(getSlotLive('DEFAULT', 'SECOND')!.pluginConnectionId).not.toBeNull()

        // The replay of each slot is named with its own versus
        const command = await plugin1.waitFor((message) => message.command === "set_replay_name")
        expect(command.payload).toEqual({ blue: "Team B", orange: "Team A", game: 1 })
        expect(plugin2.messages.find((message) => message.command === "set_replay_name").payload).toEqual({ blue: "Team C", orange: "Team D", game: 1 })
    })

    test('End of a match updates the results of the tournament', async (): Promise<void> => {
        const results = await connect('ws://localhost:3300/DEFAULT/results')
        const overlay = await connectOverlay('DEFAULT')
        const plugin = await connectPlugin('TOKEN-DEFAULT')
        plugin.send(pluginMessage)

        results.messages.length = 0
        overlay.messages.length = 0
        plugin.send({ ...matchMessage, payload: { ...matchMessage.payload, guid: "ENDED-GAME", score: [2, 1], isEnded: true } })

        const versusResults = (await results.waitFor((message) => message.results)).results
        expect(versusResults.find((versus: any) => versus.id === 1).score).toEqual([1, 0])
        expect((await overlay.waitFor((message) => message.versus)).versus.score).toEqual([1, 0])
    })

    test('Entities published at most once per interval', async (): Promise<void> => {
        const overlay = await connectOverlay('SECOND')
        const plugin = await connectPlugin('TOKEN-SECOND')
        plugin.send(pluginMessage)
        await sleep(50)

        overlay.messages.length = 0
        for (let time = 1; time <= 20; time++) plugin.send(entities(time))

        await overlay.waitFor((message) => message.entities?.time === 20, entitiesInterval * 4 + 500)
        const received = overlay.messages.filter((message) => message.entities).map((message) => message.entities.time)

        // The first payload is sent at once, the last one received is always sent
        expect(received.length).toBeLessThan(20)
        expect(received.at(-1)).toBe(20)

        // null clears the entities without waiting
        plugin.send({ topic: "entities", payload: null })
        await overlay.waitFor((message) => 'entities' in message && message.entities === null)
    })
})

describe('Slots API', () => {
    afterEach(closeSockets)

    test('Authorization required', async (): Promise<void> => {
        expect((await api('', { headers: { Authorization: 'Bearer WRONG' } })).status).toBe(401)
        expect((await app.handle(new Request('http://localhost/api/tournaments/DEFAULT/slots'))).status).toBe(401)
    })

    test('List the slots of a tournament', async (): Promise<void> => {
        const response = await api('')
        expect(response.status).toBe(200)

        const slots = await response.json()
        expect(slots.map((slot: any) => slot.id)).toEqual(expect.arrayContaining(['DEFAULT', 'SECOND', 'DISABLED']))
        expect(slots.some((slot: any) => slot.id === 'OTHERSLOT')).toBe(false)
        expect(slots.find((slot: any) => slot.id === 'DEFAULT').token).toBe('TOKEN-DEFAULT')

        expect((await app.handle(new Request('http://localhost/api/tournaments/_nope_/slots', { headers: adminHeaders }))).status).toBe(404)
    })

    test('Assign a versus to a slot', async (): Promise<void> => {
        const overlay = await connectOverlay('SECOND', 'versus')
        await overlay.waitFor((message) => message.versus?.id === 2)

        const response = await api('/SECOND', { method: 'PATCH', body: JSON.stringify({ versusId: 3 }) })
        expect(response.status).toBe(200)
        expect((await response.json()).versusId).toBe(3)

        const versus = (await overlay.waitFor((message) => message.versus?.id === 3)).versus
        expect([versus.team1.name, versus.team2.name]).toEqual(['Team A', 'Team C'])

        // Versus of another tournament, invalid body
        expect((await api('/SECOND', { method: 'PATCH', body: JSON.stringify({ versusId: 999 }) })).status).toBe(422)
        expect((await api('/SECOND', { method: 'PATCH', body: JSON.stringify({ name: '' }) })).status).toBe(422)
        expect((await api('/OTHERSLOT', { method: 'PATCH', body: JSON.stringify({ name: 'x' }) })).status).toBe(404)

        await api('/SECOND', { method: 'PATCH', body: JSON.stringify({ versusId: 2 }) })
    })

    test('Create, regenerate the token and delete a slot', async (): Promise<void> => {
        const created = await api('', { method: 'POST', body: JSON.stringify({ name: 'Slot 3', versusId: 1 }) })
        expect(created.status).toBe(201)
        const slot = await created.json()
        expect(slot.token).toMatch(/^[0-9A-F]{76}$/)

        const overlay = await connectOverlay(slot.id)
        expect((await overlay.waitFor((message) => message.versus)).versus.id).toBe(1)

        // The plugin connected with the previous token is disconnected and the token refused
        const plugin = await connectPlugin(slot.token)
        const regenerated = await (await api(`/${slot.id}/regenerate-token`, { method: 'POST' })).json()
        expect(regenerated.token).not.toBe(slot.token)
        await plugin.closed
        await expect(connectPlugin(slot.token)).rejects.toThrow()
        const newPlugin = await connectPlugin(regenerated.token)

        // Deleted: its plugin is disconnected and its overlays aren't found
        expect((await api(`/${slot.id}`, { method: 'DELETE' })).status).toBe(204)
        await newPlugin.closed
        await overlay.waitFor((message) => 'versus' in message && message.versus === null)
        expect((await app.handle(new Request(`http://localhost/DEFAULT/${slot.id}/overlay`))).status).toBe(404)
    })

    test('Disabling a slot removes it from the overlays', async (): Promise<void> => {
        const created = await (await api('', { method: 'POST', body: JSON.stringify({ name: 'Slot 4' }) })).json()
        expect((await app.handle(new Request(`http://localhost/DEFAULT/${created.id}/overlay`))).status).toBe(200)

        await api(`/${created.id}`, { method: 'PATCH', body: JSON.stringify({ enabled: false }) })
        expect((await app.handle(new Request(`http://localhost/DEFAULT/${created.id}/overlay`))).status).toBe(404)
        await expect(connectPlugin(created.token)).rejects.toThrow()

        await api(`/${created.id}`, { method: 'DELETE' })
    })
})
