import { generateTestDescription, TAGS } from "@benweese/playwright-test-commons";
import { test } from "../../../fixtures/test";
import { fetchProducts, formatPrice, parsePrice, productAt } from "../data/productData";
import { CartPage } from "../pages/CartPage";
import { HomePage } from "../pages/HomePage";
import { ProductDetailsPage } from "../pages/ProductDetailsPage";
import { ProductsPage } from "../pages/ProductsPage";

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Add products", () => {
	test(
		generateTestDescription({
			id: 32,
			description:
				"two products added from the Products page both appear in the cart with price, quantity and total",
			tags: [TAGS.UI, TAGS.SMOKE, TAGS.REGRESSION]
		}),
		async ({ page }) => {
			const allProducts = await fetchProducts();
			const first = productAt(allProducts, 0);
			const second = productAt(allProducts, 1);
			const products = new ProductsPage(page);
			const cart = new CartPage(page);

			await products.open();
			await products.addToCart(first.id);
			await products.continueShopping();
			await products.addToCart(second.id);
			await products.viewCart();

			await cart.expectUrl("/view_cart");
			await cart.expectProductCount(2);
			for (const product of [first, second]) {
				await cart.expectProductInCart(product.name);
				await cart.expectRowValues(product.name, {
					price: product.price,
					quantity: "1",
					total: formatPrice(parsePrice(product.price))
				});
			}
		}
	);

	test(
		generateTestDescription({
			id: 33,
			description: "adding a product from its detail page puts it in the cart with quantity 1",
			tags: [TAGS.UI, TAGS.REGRESSION]
		}),
		async ({ page }) => {
			const allProducts = await fetchProducts();
			const product = productAt(allProducts, Math.min(2, allProducts.length - 1));
			const details = new ProductDetailsPage(page);
			const cart = new CartPage(page);

			await details.open(product.id);
			await details.addToCart();
			await details.viewCart();

			await cart.expectProductCount(1);
			await cart.expectProductInCart(product.name);
			await cart.expectRowValues(product.name, {
				price: product.price,
				quantity: "1",
				total: formatPrice(parsePrice(product.price))
			});
		}
	);
});

test.describe("Quantity", () => {
	test(
		generateTestDescription({
			id: 34,
			description: "a quantity of 4 chosen on the detail page appears in the cart",
			tags: [TAGS.UI, TAGS.SMOKE, TAGS.REGRESSION]
		}),
		async ({ page }) => {
			const product = productAt(await fetchProducts(), 0);
			const home = new HomePage(page);
			const details = new ProductDetailsPage(page);
			const cart = new CartPage(page);

			await home.open();
			await home.openProduct(product.id);
			await details.expectUrl(`/product_details/${product.id}`);

			await details.setQuantity(4);
			await details.addToCart();
			await details.viewCart();

			await cart.expectProductCount(1);
			await cart.expectRowValues(product.name, {
				price: product.price,
				quantity: "4",
				total: formatPrice(parsePrice(product.price) * 4)
			});
		}
	);

	test(
		generateTestDescription({
			id: 35,
			description: "adding the same product twice from two pages shows one row with the summed quantity",
			tags: [TAGS.UI, TAGS.REGRESSION]
		}),
		async ({ page }) => {
			const product = productAt(await fetchProducts(), 0);
			const details = new ProductDetailsPage(page);
			const cart = new CartPage(page);

			await details.open(product.id);
			await details.setQuantity(2);
			await details.addToCart();
			await details.continueShopping();

			await details.setQuantity(3);
			await details.addToCart();
			await details.viewCart();

			await cart.expectProductCount(1);
			await cart.expectRowValues(product.name, {
				price: product.price,
				quantity: "5",
				total: formatPrice(parsePrice(product.price) * 5)
			});
		}
	);
});

test.describe("Remove", () => {
	test(
		generateTestDescription({
			id: 36,
			description: "removing one of two products leaves the other in the cart",
			tags: [TAGS.UI, TAGS.SMOKE, TAGS.REGRESSION]
		}),
		async ({ page }) => {
			const allProducts = await fetchProducts();
			const first = productAt(allProducts, 0);
			const second = productAt(allProducts, 1);
			const products = new ProductsPage(page);
			const cart = new CartPage(page);

			await products.open();
			await products.addToCart(first.id);
			await products.continueShopping();
			await products.addToCart(second.id);
			await products.viewCart();
			await cart.expectProductInCart(first.name, { soft: false });
			await cart.expectProductInCart(second.name, { soft: false });

			await cart.removeProduct(first.name, first.id);
			await cart.expectProductNotInCart(first.name);
			await cart.expectProductInCart(second.name);
			await cart.expectRowValues(second.name, {
				price: second.price,
				quantity: "1",
				total: formatPrice(parsePrice(second.price))
			});

			await cart.open();
			await cart.expectProductInCart(second.name);
			await cart.expectProductNotInCart(first.name);
		}
	);

	test(
		generateTestDescription({
			id: 37,
			description: "removing the only product shows the empty-cart message",
			tags: [TAGS.UI, TAGS.REGRESSION]
		}),
		async ({ page }) => {
			const product = productAt(await fetchProducts(), 0);
			const products = new ProductsPage(page);
			const cart = new CartPage(page);

			await products.open();
			await products.addToCart(product.id);
			await products.viewCart();
			await cart.expectProductInCart(product.name, { soft: false });

			await cart.removeProduct(product.name, product.id);
			await cart.expectProductNotInCart(product.name);
			await cart.expectEmptyCart();
		}
	);
});

test.describe("Empty cart", () => {
	test(
		generateTestDescription({
			id: 38,
			description: "a new session's cart is empty and the link leads to Products",
			tags: [TAGS.UI, TAGS.REGRESSION]
		}),
		async ({ page }) => {
			const cart = new CartPage(page);
			const products = new ProductsPage(page);

			await cart.open();
			await cart.expectEmptyCart();
			await cart.expectNoProducts();

			await cart.clickHere();
			await products.expectUrl("/products");
			await products.expectAllProductsHeading();
		}
	);
});
