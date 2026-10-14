import { join, resolve } from "node:path";

// Root of apps/realtime, from src/ or from the bundle in build/
export const root: string = resolve(import.meta.dir, "..");

export const assetsDir: string = join(root, "assets");

export const logsDir: string = process.env['LOGS_DIR'] ?? join(root, "logs");

export function page(name: string): ReturnType<typeof Bun.file> {
    return Bun.file(join(root, "src", "pages", `${name}.html`));
}
