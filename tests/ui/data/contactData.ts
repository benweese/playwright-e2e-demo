import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { uniqueEmail } from "@benweese/playwright-test-commons";
import { faker } from "@faker-js/faker";
import { config } from "../../../config";

/** What the contact form takes. */
export interface ContactMessage {
	name: string;
	email: string;
	subject: string;
	message: string;
}

/**
 * Builds a contact message with fake data and a unique address from `uniqueEmail(config.testEmail)`.
 *
 * @returns the name, email, subject and message to type into the form
 */
export function buildContactMessage(): ContactMessage {
	return {
		name: faker.person.fullName(),
		email: uniqueEmail(config.testEmail),
		subject: faker.lorem.words(3),
		message: faker.lorem.sentences(2)
	};
}

/**
 * Writes a small text file to upload, so no fixture file is committed.
 *
 * @param filePath - where to write it, e.g. `testInfo.outputPath("upload-sample.txt")`
 * @returns `filePath`
 */
export async function writeUploadFile(filePath: string): Promise<string> {
	await mkdir(path.dirname(filePath), { recursive: true });
	await writeFile(filePath, faker.lorem.sentence());
	return filePath;
}
