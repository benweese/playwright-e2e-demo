import { generateTestDescription, TAGS } from "@benweese/playwright-test-commons";
import { faker } from "@faker-js/faker";
import { test, expect } from "../../../fixtures/test";
import { fetchProducts, isRelatedToTerm, productAt, searchTermFrom } from "../data/productData";
import { HeaderComponent } from "../pages/HeaderComponent";
import { HomePage } from "../pages/HomePage";
import { ProductDetailsPage } from "../pages/ProductDetailsPage";
import { ProductsPage } from "../pages/ProductsPage";

test.describe("All products", () => {
	test(
		generateTestDescription({
			id: 26,
			description: "the Products link opens the All Products page with a product list",
			tags: [TAGS.UI, TAGS.SMOKE, TAGS.REGRESSION]
		}),
		async ({ page }) => {
			const home = new HomePage(page);
			const header = new HeaderComponent(page);
			const products = new ProductsPage(page);

			await home.open();
			await header.clickProducts();
			await products.expectUrl("/products");
			await products.expectAllProductsHeading();
			await products.expectEveryCardHasViewProductLink();
		}
	);
});

test.describe("Product detail", () => {
	test(
		generateTestDescription({
			id: 27,
			description: "View Product on the first product opens its detail page with every detail",
			tags: [TAGS.UI, TAGS.REGRESSION]
		}),
		async ({ page }) => {
			const first = productAt(await fetchProducts(), 0);
			const products = new ProductsPage(page);
			const details = new ProductDetailsPage(page);

			await products.open();
			const shownIds = await products.shownProductIds();
			expect.soft(shownIds.at(0), "id of the first card on /products").toBe(first.id);

			await products.openProduct(first.id);
			await details.expectUrl(`/product_details/${first.id}`);
			await details.expectDetails(first);
			await details.expectDefaultQuantityAndAddButton();
		}
	);

	test(
		generateTestDescription({
			id: 28,
			description: "product detail page opened by URL shows the same details",
			tags: [TAGS.UI, TAGS.REGRESSION]
		}),
		async ({ page }) => {
			const last = productAt(await fetchProducts(), -1);
			const details = new ProductDetailsPage(page);

			await details.open(last.id);
			await details.expectTitle();
			await details.expectDetails(last);
		}
	);
});

test.describe("Search", () => {
	test(
		generateTestDescription({
			id: 29,
			description: "searching by a product name word shows Searched Products with only related products",
			tags: [TAGS.UI, TAGS.SMOKE, TAGS.REGRESSION]
		}),
		async ({ page }) => {
			const allProducts = await fetchProducts();
			const source = productAt(allProducts, 0);
			const term = searchTermFrom(source);
			const products = new ProductsPage(page);

			await products.open();
			await products.search(term);
			await products.expectUrl(new RegExp(`[?&]search=${encodeURIComponent(term)}`));
			await products.expectSearchedProductsHeading();

			const shownIds = await products.shownProductIds();
			expect.soft(shownIds, `ids shown for "${term}" include the product it came from`).toContain(source.id);
			for (const id of shownIds) {
				const shown = allProducts.find((product) => product.id === id);
				expect
					.soft(
						shown !== undefined && isRelatedToTerm(term, shown),
						`product ${id} (${shown?.name ?? "not in the products API"}) is related to "${term}"`
					)
					.toBe(true);
			}
		}
	);

	test(
		generateTestDescription({
			id: 30,
			description: "search ignores letter case",
			tags: [TAGS.UI, TAGS.REGRESSION]
		}),
		async ({ page }) => {
			const allProducts = await fetchProducts();
			const source = productAt(allProducts, 0);
			const term = searchTermFrom(source).toUpperCase();
			const products = new ProductsPage(page);

			await products.open();
			await products.search(term);
			await products.expectSearchedProductsHeading();

			const shownIds = await products.shownProductIds();
			expect.soft(shownIds, `ids shown for "${term}" include the product it came from`).toContain(source.id);
			for (const id of shownIds) {
				const shown = allProducts.find((product) => product.id === id);
				expect
					.soft(
						shown !== undefined && isRelatedToTerm(term, shown),
						`product ${id} (${shown?.name ?? "not in the products API"}) is related to "${term}"`
					)
					.toBe(true);
			}
		}
	);

	test(
		generateTestDescription({
			id: 31,
			description: "searching for text that matches no product shows no products",
			tags: [TAGS.UI, TAGS.REGRESSION]
		}),
		async ({ page }) => {
			const term = faker.string.alpha({ length: 20, casing: "lower" });
			const products = new ProductsPage(page);

			await products.open();
			await products.search(term);
			await products.expectSearchedProductsHeading();
			await products.expectNoProducts();
			await products.expectSearchTerm(term);
		}
	);
});
