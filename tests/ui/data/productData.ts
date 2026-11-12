import { expect } from "../../../fixtures/test";
import { Products } from "../../../api/ProductsClient";
import type { Product } from "../../../api/types";
import { expectResponseCode } from "../../../helpers";

/**
 * Reads every product from GET /productsList, so tests take their products and prices from the
 * site's data at run time instead of hardcoding them.
 *
 * @returns the products, in the API's order (the order of the cards on /products)
 * @throws Error if the API answers an error (hard assertion on the list being non-empty)
 */
export async function fetchProducts(): Promise<Product[]> {
	const body = await expectResponseCode(await Products.list(), 200);
	expect(body.products.length, "number of products in the API").toBeGreaterThan(0);
	return body.products;
}

/**
 * Picks a product by position. A negative index counts from the end.
 *
 * @param products - the list from {@link fetchProducts}
 * @param index - 0 for the first product, -1 for the last
 * @returns the product
 * @throws Error if the list has no product at that position
 */
export function productAt(products: Product[], index: number): Product {
	const product = products.at(index);
	if (!product) {
		throw new Error(`The products API has no product at position ${index} (${products.length} products)`);
	}
	return product;
}

/**
 * Turns a price into a number.
 *
 * @param price - the price as the site writes it, e.g. "Rs. 500"
 * @returns the amount, e.g. 500
 */
export function parsePrice(price: string): number {
	return Number(/\d+(\.\d+)?/.exec(price)?.[0]);
}

/**
 * Writes an amount the way the site writes prices.
 *
 * @param amount - e.g. 1000
 * @returns e.g. "Rs. 1000"
 */
export function formatPrice(amount: number): string {
	return `Rs. ${amount}`;
}

/**
 * The category as the detail and cart pages write it.
 *
 * @param product - a product from the API
 * @returns e.g. "Women > Tops"
 */
export function categoryLabel(product: Product): string {
	return `${product.category.usertype.usertype} > ${product.category.category}`;
}

/**
 * Whether a search for a term should find a product: its name, category or brand contains the
 * term, ignoring case.
 *
 * @param term - the search term
 * @param product - the product to test
 * @returns true if the product is related to the term
 */
export function isRelatedToTerm(term: string, product: Product): boolean {
	const wanted = term.toLowerCase();
	return [product.name, categoryLabel(product), product.brand].some((text) => text.toLowerCase().includes(wanted));
}

/**
 * The term the search scenarios use: the first word of a product's name, so that product must
 * be found.
 *
 * @param product - the product the term comes from
 * @returns e.g. "Blue" for "Blue Top"
 * @throws Error if the name is empty
 */
export function searchTermFrom(product: Product): string {
	const word = product.name.split(" ").find((part) => part !== "");
	if (!word) {
		throw new Error(`Product ${product.id} has no name to search for`);
	}
	return word;
}
