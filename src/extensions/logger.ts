import {createPinoLogger, pino} from "@bogeychan/elysia-logger";
import pinopretty from "pino-pretty";
import fs from "node:fs";

export default createPinoLogger({
    level: "debug",
    /* transport: {
        target: "pino-pretty",
        options: {
            colorize: true,
        },
    }, */
    stream: pino.multistream([
        {level: 'debug', stream: pinopretty()},
        {level: 'info', stream: fs.createWriteStream('logs/debug.log')},
        {level: 'error', stream: fs.createWriteStream('logs/error.log')}
    ]),
});
