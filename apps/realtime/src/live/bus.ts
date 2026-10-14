import type { Server } from "bun";

// Server of the application, set once it listens, to publish to the subscribers of a topic
let server: Server<unknown> | null = null;

export function setServer(value: Server<unknown> | null): void {
    server = value;
}

export function publish(topic: string, payload: unknown): void {
    server?.publish(topic, JSON.stringify(payload));
}
