import { expect, type APIResponse } from "@playwright/test";
import { getBody } from "@benweese/playwright-test-commons";
import type { ApiEnvelope } from "../api/types";

/**
 * Checks an automationexercise.com API response. The API always answers HTTP 200 (with a
 * text/html content type) and puts the real status in the body, e.g.
 * `{ "responseCode": 404, "message": "User not found!" }`, so commons' `errorCheck` would fail
 * on every error case. Use this for success and error codes alike.
 *
 * Asserts HTTP 2xx (hard), parses the JSON and disposes the response, then asserts (soft) that
 * `responseCode` is `expected`.
 *
 * @template T - the body's type, taken from the client method (`this.get<ProductList>(...)`)
 * @param response - the response from an API client method
 * @param expected - the `responseCode` the body should carry
 * @returns the parsed body
 *
 * @example
 * const body = await expectResponseCode(await Products.list(), 200);
 * await expectResponseCode(await Accounts.verifyLogin(email, "wrong-password"), 404);
 */
export async function expectResponseCode<T extends ApiEnvelope>(
	response: APIResponse<T>,
	expected: number
): Promise<T> {
	const body = await getBody(response);
	expect.soft(body.responseCode, `responseCode (message: "${body.message ?? ""}")`).toBe(expected);
	return body;
}
