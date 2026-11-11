/** Runs after every project that depends on "setup": deletes the account auth.setup.ts created. */
import { rm } from "fs/promises";
import path from "path";
import { generateTestDescription } from "@benweese/playwright-test-commons";
import { test as teardown } from "../../fixtures/test";
import { config } from "../../config";
import { Accounts } from "../../api/AccountsClient";
import { expectResponseCode, readTestUser } from "../../helpers";

teardown(generateTestDescription({ id: 4, description: "delete the test account" }), async () => {
	const { email, password } = await readTestUser();
	await expectResponseCode(await Accounts.remove(email, password), 200);
	await expectResponseCode(await Accounts.verifyLogin(email, password), 404);
	await rm(path.dirname(config.auth.userFile), { recursive: true, force: true });
});
