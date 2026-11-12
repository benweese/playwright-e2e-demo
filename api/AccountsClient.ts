/**
 * Account endpoints of automationexercise.com (APIs 11–14 on https://automationexercise.com/api_list).
 * Request bodies are form-encoded, and every response carries its real status in `responseCode`;
 * check it with `expectResponseCode`.
 */
import { ApiBase } from "@benweese/playwright-test-commons";
import { config } from "../config";
import type { Account } from "../payloads/accountPayload";
import type { ApiEnvelope, UserDetail } from "./types";

/** Client for the account endpoints. Use the exported {@link Accounts} instance. */
class AccountsClient extends ApiBase {
	constructor() {
		super({ baseUrl: config.apiBaseUrl, bodyType: "form", debug: config.debug });
	}

	/**
	 * POST /createAccount. Expect `responseCode` 201 "User created!".
	 *
	 * @param account - every field the API requires; build one with `buildAccount()`
	 */
	create(account: Account) {
		return this.post<ApiEnvelope>("createAccount", account);
	}

	/**
	 * POST /verifyLogin. Expect `responseCode` 200 "User exists!", or 404 "User not found!".
	 *
	 * @param email - the account's email
	 * @param password - the account's password
	 */
	verifyLogin(email: string, password: string) {
		return this.post<ApiEnvelope>("verifyLogin", { email, password });
	}

	/**
	 * POST /verifyLogin with only `password`. Expect `responseCode` 400 "Bad request, email or password parameter is missing in POST request.".
	 *
	 * @param password - the account's password
	 */
	verifyLoginWithoutEmail(password: string) {
		return this.post<ApiEnvelope>("verifyLogin", { password });
	}

	/** DELETE /verifyLogin (no body). Not supported: expect `responseCode` 405 "This request method is not supported.". */
	verifyLoginWithDelete() {
		return this.delete<ApiEnvelope>("verifyLogin");
	}

	/**
	 * GET /getUserDetailByEmail. Expect `responseCode` 200 with the account in `user`.
	 *
	 * @param email - the account's email
	 */
	getByEmail(email: string) {
		return this.get<UserDetail>("getUserDetailByEmail", { email });
	}

	/**
	 * PUT /updateAccount. Expect `responseCode` 200 "User updated!".
	 *
	 * @param account - the full account, with `email` and `password` identifying it
	 */
	update(account: Account) {
		return this.put<ApiEnvelope>("updateAccount", account);
	}

	/**
	 * DELETE /deleteAccount. Expect `responseCode` 200 "Account deleted!".
	 *
	 * @param email - the account's email
	 * @param password - the account's password
	 */
	remove(email: string, password: string) {
		return this.delete<ApiEnvelope>("deleteAccount", { email, password });
	}
}

/** The account API client. */
export const Accounts = new AccountsClient();
