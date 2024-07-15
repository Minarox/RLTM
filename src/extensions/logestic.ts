import { Logestic } from "logestic";
import colors from "colors";
import {app} from "../index.ts";

function formatStatus(status: number): string {
    const result: string = `${status}`;
    if (status < 300) {
        return colors.green(result);
    } else if (status < 400) {
        return colors.blue(result);
    } else if (status < 500) {
        return colors.yellow(result);
    } else {
        return colors.red(result);
    }
}

function formatTime(value: bigint | number): string {
    const scales: Array<string> = ['μs', 'ms', 's', 'min', 'h'];
    let scaleIndex: number = 0;

    if (typeof value === 'bigint') {
        value = Number(value);
    }

    while (value >= 1000 && scaleIndex < scales.length - 1) {
        value /= 1000;
        scaleIndex++;
    }

    const formattedTime: string = scaleIndex === 0 ? value.toString() : value.toFixed(2);
    return colors.grey(`(${formattedTime} ${scales[scaleIndex]})`);
}

export default new Logestic({
    dest: Bun.stdout,
    showLevel: true,
    httpLogging: true,
    explicitLogging: true
})
    .use(['duration', 'method', 'path', 'status', 'time'])
    .format({
        onSuccess({duration, method, path, status, time}): string {
            const requestTo: string = colors.blue(`${method} ${path}`);

            return `[${time.toLocaleString()}] ${formatStatus(status)} | ${requestTo} ${formatTime(duration)}`;
        },
        onFailure({ request, code, datetime, error }): string {
            code = colors.red(code);
            const origin: string = app.server?.url?.origin ?? '';
            const path: string = request.url.slice(origin.length);
            const requestTo: string = colors.blue(`${request.method} ${path}`);

            return `[${datetime.toLocaleString()}] ${code} | ${requestTo} \r\n ${error}`;
        }
    });
