import { readFile } from "fs/promises";
import { config } from "../config";

/** The account the setup project created for this run. */
export interface TestUser {
	name: string;
	email: string;
	password: string;
}

/**
 * Reads the account the setup project created for this run. Use it in tests of projects that
 * depend on "setup" (the ui project does).
 *
 * @returns the account's name, email and password
 * @throws Error if the setup project hasn't run, so `.auth/user.json` doesn't exist
 *
 * @example
 * const { name } = await readTestUser();
 * await home.expectLoggedInAs(name);
 */
export async function readTestUser(): Promise<TestUser> {
	return JSON.parse(await readFile(config.auth.userFile, "utf8")) as TestUser;
}
