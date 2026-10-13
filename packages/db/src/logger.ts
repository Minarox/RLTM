// Logger of the queries, set by the application (winston in apps/realtime)
export interface Logger {
    debug(message: string): unknown;
}

export let log: Logger = { debug: () => undefined };

export function setLogger(logger: Logger): void {
    log = logger;
}
