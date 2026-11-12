import { generateTestDescription, TAGS, validateJsonSchema } from "@benweese/playwright-test-commons";
import { test, expect } from "../../../fixtures/test";
import { Products } from "../../../api/ProductsClient";
import { expectResponseCode } from "../../../helpers";

test.describe.parallel("Products API", () => {
	test(
		generateTestDescription({
			id: 5,
			description: "GET /productsList returns all products",
			tags: [TAGS.API, TAGS.REGRESSION]
		}),
		async () => {
			const body = await expectResponseCode(await Products.list(), 200);
			await validateJsonSchema("products/productsList", body);
			expect.soft(body.products.length, "number of products").toBeGreaterThan(0);
		}
	);

	test(
		generateTestDescription({
			id: 6,
			description: "POST /productsList is not supported",
			tags: [TAGS.API, TAGS.REGRESSION]
		}),
		async () => {
			const body = await expectResponseCode(await Products.listWithPost(), 405);
			await validateJsonSchema("products/apiMessage", body);
			expect.soft(body.message).toBe("This request method is not supported.");
		}
	);

	test(
		generateTestDescription({
			id: 7,
			description: "POST /searchProduct returns the searched products list",
			tags: [TAGS.API, TAGS.REGRESSION]
		}),
		async () => {
			for (const term of ["top", "tshirt", "jean"]) {
				await test.step(`search "${term}"`, async () => {
					const body = await expectResponseCode(await Products.search(term), 200);
					await validateJsonSchema("products/searchProduct", body);
					expect.soft(body.products.length, `number of products for "${term}"`).toBeGreaterThan(0);
				});
			}
		}
	);

	test(
		generateTestDescription({
			id: 8,
			description: "POST /searchProduct without search_product is a bad request",
			tags: [TAGS.API, TAGS.REGRESSION]
		}),
		async () => {
			const body = await expectResponseCode(await Products.searchWithoutTerm(), 400);
			await validateJsonSchema("products/apiMessage", body);
			expect.soft(body.message).toBe("Bad request, search_product parameter is missing in POST request.");
		}
	);
});
