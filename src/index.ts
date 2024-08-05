import { Elysia } from "elysia";
import setup from "./extensions/setup.ts";
import game from "./controllers/game.ts";

const app = new Elysia({
    name: "RLTM"
})
    .use(setup)

    .use(game)

    .listen(3000);

console.clear();
console.log(`🚀 RLTM is running at ${app.server?.url}.`);
