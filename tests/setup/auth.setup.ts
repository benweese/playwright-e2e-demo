/**
 * Runs before the ui project: creates a fresh account through the API, signs in through the UI
 * and saves the session to .auth/state.json, so ui tests start logged in.
 * auth.teardown.ts deletes the account when the run ends, so the shared practice site
 * doesn't fill up with test users.
 */
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { generateTestDescription } from "@benweese/playwright-test-commons";
import { test as setup } from "../../fixtures/test";
import { config } from "../../config";
import { Accounts } from "../../api/AccountsClient";
import { expectResponseCode, type TestUser } from "../../helpers";
import { buildAccount } from "../../payloads/accountPayload";
import { LoginPage } from "../ui/pages/LoginPage";

setup(
	generateTestDescription({ id: 3, description: "create a test account via the API and sign in" }),
	async ({ page }) => {
		const account = buildAccount();
		await expectResponseCode(await Accounts.create(account), 201);

		const { name, email, password } = account;
		const user: TestUser = { name, email, password };
		await mkdir(path.dirname(config.auth.userFile), { recursive: true });
		await writeFile(config.auth.userFile, JSON.stringify(user, null, "\t"));

		const login = new LoginPage(page);
		await login.open();
		await login.login(email, password);
		await login.expectLoggedInAs(name, { soft: false });

		await page.context().storageState({ path: config.auth.stateFile });
	}
);
