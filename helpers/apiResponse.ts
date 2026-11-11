import { expect, type APIResponse } from "@playwright/test";
import { getBody } from "@benweese/playwright-test-commons";
import type { ApiEnvelope } from "../api/types";

/**
 * automationexercise.com's API always answers HTTP 200 (with a text/html content type) and puts
 * the real status in the body: { "responseCode": 404, "message": "User not found!" }.
 * So commons' errorCheck(response, 404) would fail on every error case. Use this instead,
 * for success and error codes alike.
 *
 * @param expected - the responseCode the body should carry
 * @returns the parsed body, typed by the client method (`this.get<ProductList>(...)` → ProductList)
 */
export async function expectResponseCode<T extends ApiEnvelope>(
	response: APIResponse<T>,
	expected: number
): Promise<T> {
	const body = await getBody(response); // asserts HTTP 2xx and parses the JSON despite the content type
	expect.soft(body.responseCode, `responseCode (message: "${body.message ?? ""}")`).toBe(expected);
	return body;
}
