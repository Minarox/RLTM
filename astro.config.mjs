// @ts-check
import { defineConfig } from 'astro/config';

import db from "@astrojs/db";

// https://astro.build/config
export default defineConfig({
    site: "https://rltm.minarox.fr",
    base: "/",
    outDir: "./build",
    integrations: [db()],
    server: {
        host: "127.0.0.1"
    }
});