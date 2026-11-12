/**
 * Product endpoints of automationexercise.com (APIs 1–6 on https://automationexercise.com/api_list).
 * Request bodies are form-encoded, and every response carries its real status in `responseCode`;
 * check it with `expectResponseCode`.
 */
import { ApiBase } from "@benweese/playwright-test-commons";
import { config } from "../config";
import type { ApiEnvelope, ProductList } from "./types";

/** Client for the product endpoints. Use the exported {@link Products} instance. */
class ProductsClient extends ApiBase {
	constructor() {
		super({ baseUrl: config.apiBaseUrl, bodyType: "form", debug: config.debug });
	}

	/** GET /productsList. Expect `responseCode` 200 with every product. */
	list() {
		return this.get<ProductList>("productsList");
	}

	/**
	 * POST /searchProduct. Expect `responseCode` 200 with the matching products.
	 *
	 * @param term - text to search product names for, e.g. `"top"`
	 */
	search(term: string) {
		return this.post<ProductList>("searchProduct", { search_product: term });
	}

	/** POST /productsList (no body). Not supported: expect `responseCode` 405 "This request method is not supported.". */
	listWithPost() {
		return this.post<ApiEnvelope>("productsList");
	}

	/** POST /searchProduct without `search_product`. Expect `responseCode` 400 "Bad request, search_product parameter is missing in POST request.". */
	searchWithoutTerm() {
		return this.post<ApiEnvelope>("searchProduct");
	}
}

/** The product API client. */
export const Products = new ProductsClient();
