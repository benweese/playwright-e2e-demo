/**
 * The one place tests get settings from: `import { config } from "../../config"`.
 * automationexercise.com has a single public site, so there are no environments to choose from.
 */
import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import { configureSchemas } from "@benweese/playwright-test-commons";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const config = {
	baseUrl: "https://automationexercise.com",
	apiBaseUrl: "https://automationexercise.com/api",
	// DEBUG_API=true logs every request and response body (local debugging only).
	debug: process.env.DEBUG_API === "true",
	auth: {
		// Written by tests/setup/auth.setup.ts, removed by auth.teardown.ts. Git-ignored.
		stateFile: path.join(root, ".auth/state.json"),
		userFile: path.join(root, ".auth/user.json")
	}
};

configureSchemas({ schemasDir: path.join(root, "schemas") });
