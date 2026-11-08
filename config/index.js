/**
 * The one place tests get configuration from: `import { config } from "../../config/index.js"`.
 */
import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import { createConfig, configureSchemas } from "@benweese/playwright-test-commons";
import { environments } from "./environments.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const config = {
	...createConfig(environments, { defaultEnv: "prod" }),
	auth: {
		// Written by tests/setup/auth.setup.js, removed by auth.teardown.js. Git-ignored.
		stateFile: path.join(root, ".auth/state.json"),
		userFile: path.join(root, ".auth/user.json")
	}
};

configureSchemas({ schemasDir: path.join(root, "schemas") });
