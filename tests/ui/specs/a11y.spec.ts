import { expectNoA11yViolations, generateTestDescription, TAGS } from "@benweese/playwright-test-commons";
import { test } from "../../../fixtures/test";
import { fetchProducts, productAt } from "../data/productData";
import { CartPage } from "../pages/CartPage";
import { ContactPage } from "../pages/ContactPage";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { ProductDetailsPage } from "../pages/ProductDetailsPage";
import { ProductsPage } from "../pages/ProductsPage";

test.describe("Axe scans", () => {
	test(
		generateTestDescription({
			id: 51,
			description: "home page has no WCAG 2 A/AA violations",
			tags: [TAGS.UI, TAGS.A11Y]
		}),
		async ({ page }) => {
			const home = new HomePage(page);

			await home.open();
			await home.expectLoaded();
			await expectNoA11yViolations(page);
		}
	);

	test(
		generateTestDescription({
			id: 53,
			description: "products page has no WCAG 2 A/AA violations",
			tags: [TAGS.UI, TAGS.A11Y]
		}),
		async ({ page }) => {
			const products = new ProductsPage(page);

			await products.open();
			await products.expectAllProductsHeading();
			await products.shownProductIds();
			await expectNoA11yViolations(page);
		}
	);

	test(
		generateTestDescription({
			id: 54,
			description: "a product detail page has no WCAG 2 A/AA violations",
			tags: [TAGS.UI, TAGS.A11Y]
		}),
		async ({ page }) => {
			const product = productAt(await fetchProducts(), 0);
			const details = new ProductDetailsPage(page);

			await details.open(product.id);
			await details.expectName(product.name);
			await expectNoA11yViolations(page);
		}
	);

	test(
		generateTestDescription({
			id: 56,
			description: "contact us page has no WCAG 2 A/AA violations",
			tags: [TAGS.UI, TAGS.A11Y]
		}),
		async ({ page }) => {
			const contact = new ContactPage(page);

			await contact.open();
			await contact.expectGetInTouchHeading();
			await expectNoA11yViolations(page);
		}
	);

	test.describe("as a visitor", () => {
		test.use({ storageState: { cookies: [], origins: [] } });

		test(
			generateTestDescription({
				id: 52,
				description: "login page has no WCAG 2 A/AA violations",
				tags: [TAGS.UI, TAGS.A11Y]
			}),
			async ({ page }) => {
				const login = new LoginPage(page);

				await login.open();
				await login.expectLoginHeading();
				await expectNoA11yViolations(page);
			}
		);

		test(
			generateTestDescription({
				id: 55,
				description: "cart page with a product has no WCAG 2 A/AA violations",
				tags: [TAGS.UI, TAGS.A11Y]
			}),
			async ({ page }) => {
				const product = productAt(await fetchProducts(), 0);
				const details = new ProductDetailsPage(page);
				const cart = new CartPage(page);

				await details.open(product.id);
				await details.addToCart();
				await details.viewCart();
				await cart.expectProductInCart(product.name, { soft: false });
				await expectNoA11yViolations(page);
			}
		);
	});
});
