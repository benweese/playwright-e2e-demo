import type { Page } from "@playwright/test";
import { BasePage } from "@benweese/playwright-test-commons";
import { productsLocators, type ProductsLocators } from "../locators/productsLocators";
import { CartModal } from "./CartModal";

/** The products page, /products, which also shows search results. */
export class ProductsPage extends BasePage<ProductsLocators> {
	/** The "Added!" modal that opens after "Add to cart". */
	readonly modal: CartModal;

	/**
	 * @param page - the Playwright page
	 */
	constructor(page: Page) {
		super(page, productsLocators);
		this.modal = new CartModal(page);
	}

	/** Opens /products. */
	async open() {
		await this.goto("/products");
	}

	/** Asserts the "All Products" heading is shown. */
	async expectAllProductsHeading() {
		await this.expectVisible(this.locators.allProductsHeading, '"All Products" heading');
	}

	/** Asserts the "Searched Products" heading is shown. */
	async expectSearchedProductsHeading() {
		await this.expectVisible(this.locators.searchedProductsHeading, '"Searched Products" heading');
	}

	/**
	 * Types a term in the search box and clicks the search button.
	 *
	 * @param term - the text to search for
	 */
	async search(term: string) {
		await this.fill(this.locators.searchInput, term);
		await this.click(this.locators.searchButton);
	}

	/**
	 * Asserts the search box still holds the term that was searched.
	 *
	 * @param term - the text that was typed
	 */
	async expectSearchTerm(term: string) {
		await this.expectValue(this.locators.searchInput, term, "search box");
	}

	/**
	 * Waits for at least one product card, then reads the id of every card shown, in page order.
	 *
	 * @returns the product ids, taken from each card's "View Product" link
	 */
	async shownProductIds(): Promise<number[]> {
		await this.expectAny(this.locators.viewProductLinks, "product cards shown", { soft: false });
		const hrefs = await this.locators.viewProductLinks.evaluateAll((links) =>
			links.map((link) => link.getAttribute("href") ?? "")
		);
		return hrefs.map((href) => Number(href.replace("/product_details/", "")));
	}

	/** Asserts no product card is shown. */
	async expectNoProducts() {
		await this.expectCount(this.locators.viewProductLinks, 0, "product cards shown");
	}

	/** Asserts at least one card is shown and that every card has its own "View Product" link. */
	async expectEveryCardHasViewProductLink() {
		await this.expectAny(this.locators.productImages, "product cards shown", { soft: false });
		const cards = await this.locators.productImages.count();
		await this.expectCount(this.locators.viewProductLinks, cards, '"View Product" links, one per card');
	}

	/**
	 * Clicks "View Product" on a product's card.
	 *
	 * @param id - the product's id from the products API
	 */
	async openProduct(id: number) {
		await this.click(this.locators.viewProductLink(id));
	}

	/**
	 * Clicks "Add to cart" on a product's card and waits for the "Added!" modal.
	 *
	 * @param id - the product's id from the products API
	 */
	async addToCart(id: number) {
		await this.click(this.locators.addToCartButton(id));
		await this.modal.expectAdded();
	}

	/** Clicks "Continue Shopping" in the "Added!" modal. */
	async continueShopping() {
		await this.modal.continueShopping();
	}

	/** Clicks "View Cart" in the "Added!" modal. */
	async viewCart() {
		await this.modal.viewCart();
	}
}
