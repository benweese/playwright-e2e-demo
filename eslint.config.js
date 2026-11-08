import js from "@eslint/js";
import globals from "globals";
import playwright from "eslint-plugin-playwright";
import prettier from "eslint-config-prettier";

export default [
	{ ignores: ["**/node_modules/**", "**/playwright-report/**", "**/test-results/**", "**/.auth/**"] },
	js.configs.recommended,
	{
		languageOptions: {
			ecmaVersion: "latest",
			sourceType: "module",
			globals: { ...globals.node }
		},
		rules: {
			"no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
			"prefer-const": "error",
			"no-var": "error",
			eqeqeq: ["error", "always"]
		}
	},
	{
		files: ["tests/**/*.js", "fixtures/**/*.js"],
		...playwright.configs["flat/recommended"],
		rules: {
			...playwright.configs["flat/recommended"].rules,
			// Fixed sleeps hide timing bugs; use web-first assertions or pollUntil.
			"playwright/no-wait-for-timeout": "error",
			"playwright/no-networkidle": "error",
			// Titles come from generateTestDescription, which builds them at runtime.
			"playwright/valid-title": "off",
			// Specs call page objects and helpers that assert internally.
			"playwright/expect-expect": "off",
			"no-restricted-syntax": [
				"error",
				{
					selector: "CallExpression[callee.property.name='locator'] > Literal[value=/^\\/\\/|^xpath=/]",
					message: "XPath locators are not allowed. Use getByRole/getByLabel/getByText or a data-* container."
				},
				{
					selector: "CallExpression[callee.property.name=/^(nth|first|last)$/]",
					message: "Index-based locators are brittle. Scope to a container instead (see CLAUDE.md, Locators)."
				},
				{
					selector:
						"ImportDeclaration[source.value='@playwright/test'] ImportSpecifier[imported.name='test']",
					message: "Import test from fixtures/test.js, which blocks the site's ads (see CLAUDE.md)."
				}
			]
		}
	},
	prettier
];
