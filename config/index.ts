/**
 * Settings for the whole suite. Tests import `config` from here and nowhere else. The site has
 * one public instance, so there are no environments to choose from.
 */
import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import { configureSchemas } from "@benweese/playwright-test-commons";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Site URLs, logging and auth file locations. */
export const config = {
	/** The site under test; Playwright's `baseURL`. */
	baseUrl: "https://automationexercise.com",
	/** Root of the site's API, used by the API clients. */
	apiBaseUrl: "https://automationexercise.com/api",
	/** Log every request and response body. Set `DEBUG_API=true` in `.env` for local debugging only. */
	debug: process.env.DEBUG_API === "true",
	/**
	 * Address for the data tests create: `<localPart>+<unique>@<domain>`. Build one with
	 * commons' `uniqueEmail(config.testEmail)`. A domain we own makes the suite's accounts recognisable.
	 */
	testEmail: {
		localPart: "playwright",
		domain: "benweese.com"
	},
	/** Waits longer than Playwright's 5 s default, for steps the site is known to be slow on. */
	timeouts: {
		/** The "Added!" modal appears only after a slow server call, up to ~20 s under load. */
		addedToCartModalMs: 20_000
	},
	/** Files written by `tests/setup/auth.setup.ts` and removed by `auth.teardown.ts`. Git-ignored. */
	auth: {
		/** The logged-in browser session the ui project starts from. */
		stateFile: path.join(root, ".auth/state.json"),
		/** The run's test account: `{ name, email, password }`. Read it with `readTestUser()`. */
		userFile: path.join(root, ".auth/user.json")
	}
};

configureSchemas({ schemasDir: path.join(root, "schemas") });
