import { Elysia } from "elysia";

const app: Elysia = new Elysia()
    .get("/", (): string => "Hello Elysia")
    .listen(3000);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
