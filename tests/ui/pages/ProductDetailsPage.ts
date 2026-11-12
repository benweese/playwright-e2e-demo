import type { Page } from "@playwright/test";
import { BasePage } from "@benweese/playwright-test-commons";
import type { Product } from "../../../api/types";
import { categoryLabel } from "../data/productData";
import { productDetailsLocators, type ProductDetailsLocators } from "../locators/productDetailsLocators";
import { CartModal } from "./CartModal";

/** A product's detail page, /product_details/<id>. */
export class ProductDetailsPage extends BasePage<ProductDetailsLocators> {
	/** The "Added!" modal that opens after "Add to cart". */
	readonly modal: CartModal;

	/**
	 * @param page - the Playwright page
	 */
	constructor(page: Page) {
		super(page, productDetailsLocators);
		this.modal = new CartModal(page);
	}

	/**
	 * Opens a product's detail page.
	 *
	 * @param id - the product's id from the products API
	 */
	async open(id: number) {
		await this.goto(`/product_details/${id}`);
	}

	/** Asserts the page title is "Automation Exercise - Product Details". */
	async expectTitle() {
		await super.expectTitle("Automation Exercise - Product Details");
	}

	/**
	 * Waits for the product's name heading, the sign the page has rendered.
	 *
	 * @param name - the product's name
	 */
	async expectName(name: string) {
		await this.expectVisible(this.locators.name(name), "product name", { soft: false });
	}

	/**
	 * Waits for the product's name heading (hard), then asserts the name, category, price and brand
	 * match the API and that availability and condition have a value.
	 *
	 * @param product - the product as the products API lists it
	 */
	async expectDetails(product: Product) {
		await this.expectVisible(this.locators.name(product.name), "product name", { soft: false });
		await this.expectVisible(this.locators.category(categoryLabel(product)), "category");
		await this.expectVisible(this.locators.price(product.price), "price");
		await this.expectVisible(this.locators.availability, "availability has a value");
		await this.expectVisible(this.locators.condition, "condition has a value");
		await this.expectVisible(this.locators.brand(product.brand), "brand");
	}

	/** Asserts the quantity box holds 1 and "Add to cart" is shown. */
	async expectDefaultQuantityAndAddButton() {
		await this.expectValue(this.locators.quantityInput, "1", "quantity");
		await this.expectVisible(this.locators.addToCartButton, '"Add to cart" button');
	}

	/**
	 * Replaces the quantity.
	 *
	 * @param quantity - how many to add
	 */
	async setQuantity(quantity: number) {
		await this.fill(this.locators.quantityInput, quantity);
	}

	/** Clicks "Add to cart" and waits for the "Added!" modal. */
	async addToCart() {
		await this.click(this.locators.addToCartButton);
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
