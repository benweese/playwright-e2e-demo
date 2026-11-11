/**
 * Used only by check-test-ids.ts: the real config, but with one project that picks up every
 * test file. The real projects select tests by tag, so a test with no tag would be invisible
 * to `playwright test --list` there.
 */
import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "@playwright/test";
import base from "../playwright.config";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export default defineConfig({
	...base,
	testDir: path.join(root, "tests"),
	projects: [{ name: "all", testMatch: [/\.spec\.ts$/, /\.setup\.ts$/, /\.teardown\.ts$/] }]
});
