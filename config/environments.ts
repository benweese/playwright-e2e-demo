/**
 * Per-environment settings. TEST_ENV picks one (default "prod", the only one this site has).
 *
 * Only non-secret values go here. Add values tests need per environment here
 * (e.g. a known product id), never hardcoded in a spec.
 */
import type { EnvironmentSettings } from "@benweese/playwright-test-commons";

export const environments = {
	prod: {
		baseUrl: "https://automationexercise.com",
		apiBaseUrl: "https://automationexercise.com/api",
		// automationexercise.com is a public practice site built for this, so tests may create
		// and delete data. Set this to true for any environment where they must not.
		readOnly: false
	}
} satisfies Record<string, EnvironmentSettings>;
