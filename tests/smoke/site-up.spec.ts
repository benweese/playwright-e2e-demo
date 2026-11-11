/**
 * Proves the framework is wired up: config resolves, baseURL and the API are reachable,
 * tags select a project. Keep these; they are the first thing to run against an environment.
 */
import { generateTestDescription, TAGS } from "@benweese/playwright-test-commons";
import { test, expect } from "../../fixtures/test";
import { Products } from "../../api/ProductsClient";
import type { ProductList } from "../../api/types";
import { expectResponseCode } from "../../helpers";

test(generateTestDescription({ id: 1, description: "home page responds", tags: [TAGS.SMOKE] }), async ({ page }) => {
	// domcontentloaded: a slow third-party script shouldn't fail "is the site up".
	const response = await page.goto("/", { waitUntil: "domcontentloaded" });
	expect(response?.status(), "home page HTTP status").toBeLessThan(400);
	await expect(page).toHaveTitle(/Automation Exercise/);
});

test(generateTestDescription({ id: 2, description: "products API responds", tags: [TAGS.SMOKE] }), async () => {
	const body = await expectResponseCode<ProductList>(await Products.list(), 200);
	expect.soft(body.products.length, "number of products").toBeGreaterThan(0);
});
