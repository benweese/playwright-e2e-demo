import { faker } from "@faker-js/faker";
import { generateTestDescription, TAGS, validateJsonSchema } from "@benweese/playwright-test-commons";
import { test, expect } from "../../../fixtures/test";
import { Accounts } from "../../../api/AccountsClient";
import { expectResponseCode } from "../../../helpers";
import { buildAccount } from "../../../payloads/accountPayload";

test.describe("Verify login", () => {
	const account = buildAccount();

	test.beforeAll(async () => {
		await expectResponseCode(await Accounts.create(account), 201);
	});

	test.afterAll(async () => {
		await Accounts.remove(account.email, account.password);
	});

	test(
		generateTestDescription({
			id: 11,
			description: "verifyLogin with valid details finds the user",
			tags: [TAGS.API, TAGS.REGRESSION]
		}),
		async () => {
			const body = await expectResponseCode(await Accounts.verifyLogin(account.email, account.password), 200);
			await validateJsonSchema("accounts/apiMessage", body);
			expect.soft(body.message).toBe("User exists!");
		}
	);

	test(
		generateTestDescription({
			id: 12,
			description: "verifyLogin without email is a bad request",
			tags: [TAGS.API, TAGS.REGRESSION]
		}),
		async () => {
			const body = await expectResponseCode(await Accounts.verifyLoginWithoutEmail(account.password), 400);
			await validateJsonSchema("accounts/apiMessage", body);
			expect.soft(body.message).toBe("Bad request, email or password parameter is missing in POST request.");
		}
	);

	test(
		generateTestDescription({
			id: 13,
			description: "DELETE verifyLogin is not supported",
			tags: [TAGS.API, TAGS.REGRESSION]
		}),
		async () => {
			const body = await expectResponseCode(await Accounts.verifyLoginWithDelete(), 405);
			await validateJsonSchema("accounts/apiMessage", body);
			expect.soft(body.message).toBe("This request method is not supported.");
		}
	);

	test(
		generateTestDescription({
			id: 14,
			description: "verifyLogin with invalid details finds no user",
			tags: [TAGS.API, TAGS.REGRESSION]
		}),
		async () => {
			const unknown = buildAccount();
			const body = await expectResponseCode(await Accounts.verifyLogin(unknown.email, unknown.password), 404);
			await validateJsonSchema("accounts/apiMessage", body);
			expect.soft(body.message).toBe("User not found!");
		}
	);
});

test.describe("Account lifecycle", () => {
	const shared = buildAccount();

	test.beforeAll(async () => {
		await expectResponseCode(await Accounts.create(shared), 201);
	});

	test.afterAll(async () => {
		await Accounts.remove(shared.email, shared.password);
	});

	test(
		generateTestDescription({
			id: 15,
			description: "createAccount registers a new user",
			tags: [TAGS.API, TAGS.REGRESSION]
		}),
		async () => {
			const account = buildAccount();
			try {
				const body = await expectResponseCode(await Accounts.create(account), 201);
				await validateJsonSchema("accounts/apiMessage", body);
				expect.soft(body.message).toBe("User created!");
			} finally {
				await Accounts.remove(account.email, account.password);
			}
		}
	);

	test(
		generateTestDescription({
			id: 16,
			description: "deleteAccount removes the account",
			tags: [TAGS.API, TAGS.REGRESSION]
		}),
		async () => {
			const account = buildAccount();
			let response: Awaited<ReturnType<typeof Accounts.remove>>;
			try {
				await expectResponseCode(await Accounts.create(account), 201);
			} finally {
				response = await Accounts.remove(account.email, account.password);
			}
			const body = await expectResponseCode(response, 200);
			await validateJsonSchema("accounts/apiMessage", body);
			expect.soft(body.message).toBe("Account deleted!");
		}
	);

	test(
		generateTestDescription({
			id: 17,
			description: "updateAccount updates the user",
			tags: [TAGS.API, TAGS.REGRESSION]
		}),
		async () => {
			const city = faker.location.city();
			const company = faker.company.name();
			const updated = await expectResponseCode(await Accounts.update({ ...shared, city, company }), 200);
			await validateJsonSchema("accounts/apiMessage", updated);
			expect.soft(updated.message).toBe("User updated!");

			const detail = await expectResponseCode(await Accounts.getByEmail(shared.email), 200);
			await validateJsonSchema("accounts/userDetail", detail);
			expect.soft(detail.user.city).toBe(city);
			expect.soft(detail.user.company).toBe(company);
		}
	);

	test(
		generateTestDescription({
			id: 18,
			description: "getUserDetailByEmail returns the user detail",
			tags: [TAGS.API, TAGS.REGRESSION]
		}),
		async () => {
			const body = await expectResponseCode(await Accounts.getByEmail(shared.email), 200);
			await validateJsonSchema("accounts/userDetail", body);
			expect.soft(body.user.email).toBe(shared.email);
			expect.soft(body.user.name).toBe(shared.name);
		}
	);
});
