import { ApiBase } from "@benweese/playwright-test-commons";
import { config } from "../config";
import type { Account } from "../payloads/accountPayload";

/** Account endpoints (APIs 11–14 on https://automationexercise.com/api_list). Form-encoded bodies. */
class AccountsClient extends ApiBase {
	constructor() {
		super({ baseUrl: config.apiBaseUrl, bodyType: "form", debug: config.debug });
	}

	create(account: Account) {
		return this.post("createAccount", account);
	}

	verifyLogin(email: string, password: string) {
		return this.post("verifyLogin", { email, password });
	}

	getByEmail(email: string) {
		return this.get("getUserDetailByEmail", { email });
	}

	update(account: Account) {
		return this.put("updateAccount", account);
	}

	remove(email: string, password: string) {
		return this.delete("deleteAccount", { email, password });
	}
}

export const Accounts = new AccountsClient();
