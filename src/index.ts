import { Elysia } from "elysia";
import logestic from "./plugins/logestic.ts";
import game from "./controllers/game.ts";

const app = new Elysia()
    // Plugins
    .use(logestic)

    // Controllers
    .use(game)

    .get("/", (): string => "Hello World!")

    .listen(3000);

console.log(`🏎️ RLTM is running at http://${app.server?.hostname}:${app.server?.port}`);
