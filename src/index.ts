import { Elysia } from "elysia";
import gameController from "./controllers/gameController.ts";
import logestic from "./plugins/logestic.ts";

    .use(gameController)
const app = new Elysia()
    // Plugins
    .use(logestic)

    // Controllers

    .get("/", (): string => "Hello World!")

    .listen(3000);

console.log(`🏎️ RLTM is running at http://${app.server?.hostname}:${app.server?.port}`);
