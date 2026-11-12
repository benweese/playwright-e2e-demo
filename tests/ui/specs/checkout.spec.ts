import { generateTestDescription, TAGS } from "@benweese/playwright-test-commons";
import { faker } from "@faker-js/faker";
import { test } from "../../../fixtures/test";
import { Accounts } from "../../../api/AccountsClient";
import { expectResponseCode } from "../../../helpers";
import { buildAccount } from "../../../payloads/accountPayload";
import { buildPayment } from "../data/paymentData";
import { fetchProducts, formatPrice, parsePrice, productAt } from "../data/productData";
import { CartPage } from "../pages/CartPage";
import { CheckoutPage } from "../pages/CheckoutPage";
import { HeaderComponent } from "../pages/HeaderComponent";
import { LoginPage } from "../pages/LoginPage";
import { PaymentPage } from "../pages/PaymentPage";
import { ProductDetailsPage } from "../pages/ProductDetailsPage";

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Proceed to checkout", () => {
	test(
		generateTestDescription({
			id: 39,
			description: "a logged-out visitor is asked to register or log in before checkout",
			tags: [TAGS.UI, TAGS.REGRESSION]
		}),
		async ({ page }) => {
			const product = productAt(await fetchProducts(), 0);
			const details = new ProductDetailsPage(page);
			const cart = new CartPage(page);
			const login = new LoginPage(page);

			await details.open(product.id);
			await details.addToCart();
			await details.viewCart();

			await cart.proceedToCheckout();
			await cart.expectRegisterLoginModal();
			await cart.expectUrl("/view_cart");

			await cart.clickRegisterLogin();
			await login.expectUrl("/login");
		}
	);

	test(
		generateTestDescription({
			id: 40,
			description: "checkout shows the registered address as delivery and billing address",
			tags: [TAGS.UI, TAGS.REGRESSION]
		}),
		async ({ page }) => {
			const product = productAt(await fetchProducts(), 0);
			const account = buildAccount();
			await expectResponseCode(await Accounts.create(account), 201);
			const login = new LoginPage(page);
			const header = new HeaderComponent(page);
			const details = new ProductDetailsPage(page);
			const cart = new CartPage(page);
			const checkout = new CheckoutPage(page);

			try {
				await login.open();
				await login.login(account.email, account.password);
				await header.expectLoggedInAs(account.name, { soft: false });

				await details.open(product.id);
				await details.addToCart();
				await cart.open();

				await cart.proceedToCheckout();
				await checkout.expectLoaded();
				await checkout.expectDeliveryAddress(account);
				await checkout.expectBillingAddress(account);
			} finally {
				await Accounts.remove(account.email, account.password);
			}
		}
	);

	test(
		generateTestDescription({
			id: 41,
			description: "Review Your Order lists the product with price, quantity and total",
			tags: [TAGS.UI, TAGS.REGRESSION]
		}),
		async ({ page }) => {
			const product = productAt(await fetchProducts(), 0);
			const total = formatPrice(parsePrice(product.price) * 2);
			const account = buildAccount();
			await expectResponseCode(await Accounts.create(account), 201);
			const login = new LoginPage(page);
			const header = new HeaderComponent(page);
			const details = new ProductDetailsPage(page);
			const cart = new CartPage(page);
			const checkout = new CheckoutPage(page);

			try {
				await login.open();
				await login.login(account.email, account.password);
				await header.expectLoggedInAs(account.name, { soft: false });

				await details.open(product.id);
				await details.setQuantity(2);
				await details.addToCart();

				await cart.open();
				await cart.proceedToCheckout();
				await checkout.expectReviewHeading();
				await checkout.expectRowValues(product.name, { price: product.price, quantity: "2", total });
				await checkout.expectTotalAmount(total);
			} finally {
				await Accounts.remove(account.email, account.password);
			}
		}
	);
});

test.describe("Place the order", () => {
	test(
		generateTestDescription({
			id: 42,
			description: "log in, check out and place an order",
			tags: [TAGS.UI, TAGS.SMOKE, TAGS.SLOW, TAGS.REGRESSION]
		}),
		async ({ page }) => {
			const product = productAt(await fetchProducts(), 0);
			const account = buildAccount();
			await expectResponseCode(await Accounts.create(account), 201);
			const login = new LoginPage(page);
			const header = new HeaderComponent(page);
			const details = new ProductDetailsPage(page);
			const cart = new CartPage(page);
			const checkout = new CheckoutPage(page);
			const payment = new PaymentPage(page);

			try {
				await login.open();
				await login.login(account.email, account.password);
				await header.expectLoggedInAs(account.name, { soft: false });

				await details.open(product.id);
				await details.addToCart();

				await cart.open();
				await cart.expectProductInCart(product.name);

				await cart.proceedToCheckout();
				await checkout.expectUrl("/checkout");

				await checkout.fillComment(faker.lorem.sentence());
				await checkout.placeOrder();
				await payment.expectLoaded();

				await payment.fillPayment(buildPayment());
				await payment.pay();
				await payment.expectOrderPlacedMessage();
			} finally {
				await Accounts.remove(account.email, account.password);
			}
		}
	);
});

test.describe("Payment validation", () => {
	test(
		generateTestDescription({
			id: 43,
			description: "the payment form is not submitted when its fields are empty",
			tags: [TAGS.UI, TAGS.REGRESSION]
		}),
		async ({ page }) => {
			const product = productAt(await fetchProducts(), 0);
			const account = buildAccount();
			await expectResponseCode(await Accounts.create(account), 201);
			const login = new LoginPage(page);
			const header = new HeaderComponent(page);
			const details = new ProductDetailsPage(page);
			const cart = new CartPage(page);
			const checkout = new CheckoutPage(page);
			const payment = new PaymentPage(page);

			try {
				await login.open();
				await login.login(account.email, account.password);
				await header.expectLoggedInAs(account.name, { soft: false });

				await details.open(product.id);
				await details.addToCart();

				await cart.open();
				await cart.proceedToCheckout();
				await checkout.fillComment(faker.lorem.sentence());
				await checkout.placeOrder();
				await payment.expectLoaded();

				await payment.pay();
				await payment.expectUrl("/payment");
				await payment.expectNoOrderPlaced();
				await payment.expectNameOnCardInvalid();
			} finally {
				await Accounts.remove(account.email, account.password);
			}
		}
	);
});
