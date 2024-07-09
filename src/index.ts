import { Elysia } from "elysia";
import logestic from "./plugins/logestic.ts";
import game from "./controllers/game.ts";
import {PlayersDatabase} from "./databases/players.ts";

const app = new Elysia()
    // Plugins
    .use(logestic)

    // Databases
    .decorate('players', new PlayersDatabase())

    // Controllers
    .use(game)

    .get("/", (): string => "Hello World!")

    .listen(3000);

console.log(`🏎️ RLTM is running at http://${app.server?.hostname}:${app.server?.port}`);
