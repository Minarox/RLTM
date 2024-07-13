import {createPinoLogger, pino} from "@bogeychan/elysia-logger";
import pinopretty from "pino-pretty";
import fs from "node:fs";
import { app } from "../index.ts";

export default createPinoLogger({
    level: "debug",
    stream: pino.multistream([
        {level: 'debug', stream: pinopretty({
                singleLine: true,
                hideObject: true,
                messageFormat: (log): string => {
                    const origin: string = app?.server?.url?.origin || '';
                    const request: any = log["request"];
                    return `${request.method} ${request.url.slice(origin.length)} (${parseFloat(log["responseTime"] as string).toFixed(2)}ms)\n`;
                }
            })},
        {level: 'info', stream: fs.createWriteStream('logs/debug.log')},
        {level: 'error', stream: fs.createWriteStream('logs/error.log')}
    ]),
});
