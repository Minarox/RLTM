import { Elysia } from "elysia";
import gameController from "./controllers/gameController.ts";

const app: Elysia = new Elysia()
    .use(gameController)

    .get("/", (): string => "Hello World!")

    .listen(3000);

console.log(`🏎️ RLTM is running at http://${app.server?.hostname}:${app.server?.port}`);
