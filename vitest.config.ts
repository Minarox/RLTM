/// <reference types="vitest" />
import { getViteConfig } from "astro/config";
import { configDefaults } from "vitest/config";

export default getViteConfig({
    preview: {
        host: '127.0.0.1'
    },
    test: {
        include: ["test/**/*.test.ts"],
        exclude: [...configDefaults.exclude],
        coverage: {
            reporter: ["text", "html", "json-summary", "json"],
            include: ["src/**/*"],
            reportOnFailure: true,
            thresholds: {
                lines: 80,
                branches: 80,
                functions: 80,
                statements: 80
            }
        }
    }
});