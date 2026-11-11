import { readFile } from "fs/promises";
import { config } from "../config";

export interface TestUser {
	name: string;
	email: string;
	password: string;
}

/**
 * The account the setup project created for this run.
 * Available to any test in a project that depends on "setup" (ui does).
 */
export async function readTestUser(): Promise<TestUser> {
	return JSON.parse(await readFile(config.auth.userFile, "utf8")) as TestUser;
}
