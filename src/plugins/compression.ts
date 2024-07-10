import { compression } from "elysia-compress";
import * as zlib from "node:zlib";

export default compression({
    TTL: 3600,
    brotliOptions: {
        params: {
            [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT,
            [zlib.constants.BROTLI_PARAM_QUALITY]: 4,
        },
    },
    zlibOptions: {
        level: 6,
    },
});
