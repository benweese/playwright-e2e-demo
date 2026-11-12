import { generateTestDescription, TAGS, validateJsonSchema } from "@benweese/playwright-test-commons";
import { test, expect } from "../../../fixtures/test";
import { Brands } from "../../../api/BrandsClient";
import { expectResponseCode } from "../../../helpers";

test.describe.parallel("Brands API", () => {
	test(
		generateTestDescription({
			id: 9,
			description: "GET /brandsList returns all brands",
			tags: [TAGS.API, TAGS.REGRESSION]
		}),
		async () => {
			const body = await expectResponseCode(await Brands.list(), 200);
			await validateJsonSchema("brands/brandsList", body);
			expect.soft(body.brands.length, "number of brands").toBeGreaterThan(0);
		}
	);

	test(
		generateTestDescription({
			id: 10,
			description: "PUT /brandsList is not supported",
			tags: [TAGS.API, TAGS.REGRESSION]
		}),
		async () => {
			const body = await expectResponseCode(await Brands.listWithPut(), 405);
			await validateJsonSchema("brands/apiMessage", body);
			expect.soft(body.message).toBe("This request method is not supported.");
		}
	);
});
