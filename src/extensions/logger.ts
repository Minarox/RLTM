import colors from "colors";
import { config, createLogger, format, transports } from "winston";

const consoleFormat = format.printf(({ level, message }): any => {
    const color: string = config.npm.colors[level] as string;
    const bgColor: string = `bg${color.slice(0, 1).toUpperCase()}${color.slice(1)}`;
    const status: string = colors.bold(colors[bgColor](` ${level.toUpperCase()} `));

    if (level === 'http') {
        const split: string[] = message.split(' ');
        const method: string = colorizeMethod(split[0]);

        message = `${method} ${split.slice(1).join(' ')}`;
    }

    if (level === 'error') {
        const split: string[] = message.split('|');
        const splitRequest: string[] = split[0].split(' ');
        const method: string = colorizeMethod(splitRequest[0]);
        const code: string = colors.red(splitRequest[2]);

        message = `${method} ${splitRequest.slice(1, 2).join(' ')} ${code}\r\n${split[1].slice(1)}`;
    }

    return `[${new Date().toLocaleString('fr-FR', { timeZone: 'UTC' })}] ${status} ${message}`;
});

const fileFormat = format.printf(({ level, message }): string => {
    return JSON.stringify({
        timestamp: new Date().toLocaleString('fr-FR', { timeZone: 'UTC' }),
        level: level,
        message: message
    })
})

function colorizeMethod(method: string): string {
    switch (method) {
        case 'GET':
            return colors.blue(method);
        case 'POST':
            return colors.green(method);
        case 'PUT':
            return colors.yellow(method);
        case 'DELETE':
            return colors.red(method);
        default:
            return colors.gray(method);
    }
}

export default createLogger({
    level: "verbose",
    silent: process.env['NODE_ENV'] === "test",
    transports: [
        new transports.Console({
            format: consoleFormat
        }),
        new transports.File({
            dirname: "",
            filename: "all.log",
            format: fileFormat,
            lazy: true,
            maxsize: 1048576,
            maxFiles: 4,
            zippedArchive: true

        }),
        new transports.File({
            level: "error",
            dirname: "",
            filename: "errors.log",
            format: fileFormat,
            lazy: true,
            maxsize: 1048576,
            maxFiles: 4,
            zippedArchive: true
        })
    ]
});
