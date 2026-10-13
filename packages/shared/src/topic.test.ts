import { describe, expect, test } from 'bun:test'
import { Topic, topicName } from "./topic.ts"

describe('Topics', () => {
    test('Names of the tournament and slot topics', (): void => {
        expect(topicName.tournament("T1", Topic.RESULTS)).toBe("t:T1:results")
        expect(topicName.slot("S1", Topic.ENTITIES)).toBe("s:S1:entities")
    })
})
