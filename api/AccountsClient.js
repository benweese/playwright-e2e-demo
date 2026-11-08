import { ApiBase } from "@benweese/playwright-test-commons";
import { config } from "../config/index.js";

/** Account endpoints (APIs 11–14 on https://automationexercise.com/api_list). Form-encoded bodies. */
class AccountsClient extends ApiBase {
	constructor() {
		super({ baseUrl: config.apiBaseUrl, bodyType: "form", debug: config.debug });
	}

	/** @param {ReturnType<typeof import("../payloads/accountPayload.js").buildAccount>} account */
	create(account) {
		return this.post("createAccount", account);
	}

	verifyLogin(email, password) {
		return this.post("verifyLogin", { email, password });
	}

	getByEmail(email) {
		return this.get("getUserDetailByEmail", { email });
	}

	update(account) {
		return this.put("updateAccount", account);
	}

	remove(email, password) {
		return this.delete("deleteAccount", { email, password });
	}
}

export const Accounts = new AccountsClient();
