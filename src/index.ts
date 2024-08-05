import { Elysia } from "elysia";
import ws from "./controllers/ws.ts";
import game from "./controllers/game.ts";

const app = new Elysia({
    name: "RLTM"
})
    .use(ws)
    .use(game)

    .listen(3000);

console.clear();
console.log(`🚀 RLTM is running at ${app.server?.url}.`);
