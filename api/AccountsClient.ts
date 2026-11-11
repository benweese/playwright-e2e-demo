import { ApiBase } from "@benweese/playwright-test-commons";
import { config } from "../config";
import type { Account } from "../payloads/accountPayload";
import type { ApiEnvelope, UserDetail } from "./types";

/** Account endpoints (APIs 11–14 on https://automationexercise.com/api_list). Form-encoded bodies. */
class AccountsClient extends ApiBase {
	constructor() {
		super({ baseUrl: config.apiBaseUrl, bodyType: "form", debug: config.debug });
	}

	create(account: Account) {
		return this.post<ApiEnvelope>("createAccount", account);
	}

	verifyLogin(email: string, password: string) {
		return this.post<ApiEnvelope>("verifyLogin", { email, password });
	}

	getByEmail(email: string) {
		return this.get<UserDetail>("getUserDetailByEmail", { email });
	}

	update(account: Account) {
		return this.put<ApiEnvelope>("updateAccount", account);
	}

	remove(email: string, password: string) {
		return this.delete<ApiEnvelope>("deleteAccount", { email, password });
	}
}

export const Accounts = new AccountsClient();
