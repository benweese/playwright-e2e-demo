/**
 * Brand endpoints of automationexercise.com (APIs 3–4 on https://automationexercise.com/api_list).
 * Every response carries its real status in `responseCode`; check it with `expectResponseCode`.
 */
import { ApiBase } from "@benweese/playwright-test-commons";
import { config } from "../config";
import type { ApiEnvelope, BrandList } from "./types";

/** Client for the brand endpoints. Use the exported {@link Brands} instance. */
class BrandsClient extends ApiBase {
	constructor() {
		super({ baseUrl: config.apiBaseUrl, bodyType: "form", debug: config.debug });
	}

	/** GET /brandsList. Expect `responseCode` 200 with every brand. */
	list() {
		return this.get<BrandList>("brandsList");
	}

	/** PUT /brandsList (no body). Not supported: expect `responseCode` 405 "This request method is not supported.". */
	listWithPut() {
		return this.put<ApiEnvelope>("brandsList");
	}
}

/** The brand API client. */
export const Brands = new BrandsClient();
