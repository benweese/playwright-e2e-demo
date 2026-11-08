import { ApiBase } from "@benweese/playwright-test-commons";
import { config } from "../config/index.js";

/** Product endpoints (APIs 1–6 on https://automationexercise.com/api_list). Form-encoded bodies. */
class ProductsClient extends ApiBase {
	constructor() {
		super({ baseUrl: config.apiBaseUrl, bodyType: "form", debug: config.debug });
	}

	list() {
		return this.get("productsList");
	}

	search(term) {
		return this.post("searchProduct", { search_product: term });
	}
}

export const Products = new ProductsClient();
