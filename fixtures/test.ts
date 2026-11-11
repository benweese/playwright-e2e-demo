/**
 * `test` and `expect` for every spec in this repo. Import them from here, never from
 * `@playwright/test` (lint enforces it).
 */
// eslint-disable-next-line no-restricted-syntax -- this is the one file that extends the base test
import { test as base, expect } from "@playwright/test";

/**
 * Ad and tracking hosts. automationexercise.com serves Google ads, including full-page
 * "vignette" ads that cover the page after a navigation and swallow clicks, and some of these
 * scripts (Cloudflare's analytics beacon among them) can hang and stall the page's load event.
 * None of them are part of the site under test.
 */
const BLOCKED_HOSTS =
	/(^|\.)(googlesyndication\.com|doubleclick\.net|googleadservices\.com|adservice\.google\.com|googletagservices\.com|googletagmanager\.com|google-analytics\.com|fundingchoicesmessages\.google\.com|adtrafficquality\.google|cloudflareinsights\.com)$/;

/** Playwright's `test`, with every browser context blocking {@link BLOCKED_HOSTS} before any page loads. */
export const test = base.extend({
	context: async ({ context }, use) => {
		await context.route(
			(url) => BLOCKED_HOSTS.test(url.hostname),
			(route) => route.abort("blockedbyclient")
		);
		await use(context);
	}
});

export { expect };
