import {createPinoLogger, pino} from "@bogeychan/elysia-logger";
import pinopretty from "pino-pretty";
import fs from "node:fs";

export default createPinoLogger({
    level: "debug",
    stream: pino.multistream([
        {level: 'debug', stream: pinopretty({
                singleLine: true,
                hideObject: true,
                messageFormat: (log) => {
                    return `${JSON.stringify(log)}\n`
                }
            })},
        {level: 'info', stream: fs.createWriteStream('logs/debug.log')},
        {level: 'error', stream: fs.createWriteStream('logs/error.log')}
    ]),
});
