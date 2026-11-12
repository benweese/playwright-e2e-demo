import { generateTestDescription, TAGS, uniqueEmail } from "@benweese/playwright-test-commons";
import { config } from "../../../config";
import { test } from "../../../fixtures/test";
import { CartPage } from "../pages/CartPage";
import { HeaderComponent } from "../pages/HeaderComponent";
import { HomePage } from "../pages/HomePage";

test.describe("Subscription on the home page", () => {
	test(
		generateTestDescription({
			id: 48,
			description: "subscribing from the home page footer shows the success message",
			tags: [TAGS.UI, TAGS.SMOKE, TAGS.REGRESSION]
		}),
		async ({ page }) => {
			const home = new HomePage(page);

			await home.open();
			await home.subscription.scrollToFooter();
			await home.subscription.expectHeading();

			await home.subscription.fillEmail(uniqueEmail(config.testEmail));
			await home.subscription.clickSubscribe();
			await home.subscription.expectSubscribed();
			await home.subscription.expectEmailEmpty();
		}
	);
});

test.describe("Subscription on the cart page", () => {
	test.use({ storageState: { cookies: [], origins: [] } });

	test(
		generateTestDescription({
			id: 49,
			description: "subscribing from the cart page footer shows the success message",
			tags: [TAGS.UI, TAGS.REGRESSION]
		}),
		async ({ page }) => {
			const home = new HomePage(page);
			const header = new HeaderComponent(page);
			const cart = new CartPage(page);

			await home.open();
			await header.clickCart();
			await cart.expectUrl("/view_cart");

			await cart.subscription.scrollToFooter();
			await cart.subscription.expectHeading();

			await cart.subscription.fillEmail(uniqueEmail(config.testEmail));
			await cart.subscription.clickSubscribe();
			await cart.subscription.expectSubscribed();
		}
	);
});

test.describe("Validation", () => {
	test(
		generateTestDescription({
			id: 50,
			description: "subscribing with an empty or malformed email is blocked",
			tags: [TAGS.UI, TAGS.REGRESSION]
		}),
		async ({ page }) => {
			const home = new HomePage(page);

			await home.open();
			await home.subscription.scrollToFooter();

			await home.subscription.clickSubscribe();
			await home.subscription.expectEmailInvalid();
			await home.subscription.expectNotSubscribed();

			await home.subscription.fillEmail("notanemail");
			await home.subscription.clickSubscribe();
			await home.subscription.expectEmailInvalid();
			await home.subscription.expectNotSubscribed();
			await home.expectUrl("/");
		}
	);
});
