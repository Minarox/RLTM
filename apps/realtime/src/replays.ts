import { existsSync } from "node:fs";
import { mkdir, rename, rm } from "node:fs/promises";
import { join } from "node:path";
import { root } from "./paths.ts";

// Replays of the matches, sent by the plugin at the end of each match and named by the guid of the match.
// Kept on disk for now: only this module knows where they are stored (an object storage can replace it).

export const replaysDir: string = process.env['REPLAYS_DIR'] ?? join(root, "replays");

// Maximum size of a replay file (a match is usually 1 to 3 MB)
export const maxReplaySize: number = Number(process.env['REPLAY_MAX_SIZE'] ?? 32 * 1024 * 1024) || 32 * 1024 * 1024;

// Guid of a match of Rocket League: also the name of its file, so nothing that could leave the folder
export function isValidGuid(guid: string): boolean {
    return /^[A-Za-z0-9-]{1,64}$/.test(guid);
}

// Replay file of Rocket League: its header contains the class of the replay (TAGame.Replay_Soccar_TA...)
export function isReplayFile(data: Uint8Array): boolean {
    return new TextDecoder("latin1").decode(data.subarray(0, 256)).includes("TAGame.Replay_");
}

function getReplayPath(guid: string): string {
    return join(replaysDir, `${guid}.replay`);
}

export function hasReplay(guid: string): boolean {
    return isValidGuid(guid) && existsSync(getReplayPath(guid));
}

export function getReplayFile(guid: string): ReturnType<typeof Bun.file> | undefined {
    return hasReplay(guid) ? Bun.file(getReplayPath(guid)) : undefined;
}

// Written in a temporary file then renamed: a download never gets a partial file
export async function saveReplay(guid: string, data: Uint8Array): Promise<void> {
    await mkdir(replaysDir, { recursive: true });

    const temporaryPath = join(replaysDir, `${guid}.${process.pid}.${Date.now()}.tmp`);
    try {
        await Bun.write(temporaryPath, data);
        await rename(temporaryPath, getReplayPath(guid));
    } catch (error) {
        await rm(temporaryPath, { force: true });
        throw error;
    }
}
