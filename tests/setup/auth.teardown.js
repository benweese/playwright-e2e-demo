/** Runs after every project that depends on "setup": deletes the account auth.setup.js created. */
import { rm } from "fs/promises";
import path from "path";
import { generateTestDescription } from "@benweese/playwright-test-commons";
import { test as teardown } from "../../fixtures/test.js";
import { config } from "../../config/index.js";
import { Accounts } from "../../api/AccountsClient.js";
import { expectResponseCode, readTestUser } from "../../helpers/index.js";

teardown(generateTestDescription({ id: "SETUP-002", description: "delete the test account" }), async () => {
	const { email, password } = await readTestUser();
	await expectResponseCode(await Accounts.remove(email, password), 200);
	await expectResponseCode(await Accounts.verifyLogin(email, password), 404);
	await rm(path.dirname(config.auth.userFile), { recursive: true, force: true });
});
