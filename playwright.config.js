import { defineConfig, devices } from "@playwright/test";
import { config } from "./config/index.js";

/**
 * Projects select tests by tag (tags come from TAGS in @benweese/playwright-test-commons):
 *   smoke    – @smoke, quick "is the site up" checks
 *   api      – @api
 *   setup    – creates a test account via the API, signs in, saves .auth/state.json
 *   ui       – @ui, desktop Chrome, starts logged in (depends on setup)
 *   teardown – deletes the test account after ui finishes
 *
 * A test with none of the smoke/api/ui tags runs in no project. The planner tags every scenario.
 */
export default defineConfig({
	testDir: "./tests",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI
		? [["list"], ["github"], ["html", { open: "never" }]]
		: [["list"], ["html", { open: "on-failure" }]],
	use: {
		baseURL: config.baseUrl,
		// The site marks its form controls with data-qa; getByTestId reads that attribute.
		testIdAttribute: "data-qa",
		trace: "retain-on-failure",
		screenshot: "only-on-failure"
	},
	projects: [
		{ name: "smoke", grep: /@smoke/, use: { ...devices["Desktop Chrome"] } },
		{ name: "api", grep: /@api/ },
		{
			name: "setup",
			testMatch: /auth\.setup\.js/,
			teardown: "teardown",
			use: { ...devices["Desktop Chrome"] }
		},
		{ name: "teardown", testMatch: /auth\.teardown\.js/ },
		{
			name: "ui",
			grep: /@ui/,
			dependencies: ["setup"],
			use: { ...devices["Desktop Chrome"], storageState: config.auth.stateFile }
		}
	]
});
