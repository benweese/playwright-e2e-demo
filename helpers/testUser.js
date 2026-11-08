import { readFile } from "fs/promises";
import { config } from "../config/index.js";

/**
 * The account the setup project created for this run: { name, email, password }.
 * Available to any test in a project that depends on "setup" (ui does).
 */
export async function readTestUser() {
	return JSON.parse(await readFile(config.auth.userFile, "utf8"));
}
