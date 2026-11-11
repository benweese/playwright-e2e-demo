import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import playwright from "eslint-plugin-playwright";
import jsdoc from "eslint-plugin-jsdoc";
import prettier from "eslint-config-prettier";

export default tseslint.config(
	{ ignores: ["**/node_modules/**", "**/playwright-report/**", "**/test-results/**", "**/.auth/**"] },
	js.configs.recommended,
	...tseslint.configs.recommended,
	{
		languageOptions: {
			ecmaVersion: "latest",
			sourceType: "module",
			globals: { ...globals.node }
		},
		rules: {
			"@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
			"@typescript-eslint/consistent-type-imports": "error",
			"prefer-const": "error",
			"no-var": "error",
			eqeqeq: ["error", "always"]
		}
	},
	{
		files: ["tests/**/*.ts", "fixtures/**/*.ts"],
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
					message:
						"XPath locators are not allowed. Use getByRole/getByLabel/getByText, scoped to a good container if needed (see CLAUDE.md, Locators)."
				},
				{
					selector: "CallExpression[callee.property.name=/^(nth|first|last)$/]",
					message: "Index-based locators are brittle. Scope to a container instead (see CLAUDE.md, Locators)."
				},
				{
					selector:
						"ImportDeclaration[source.value='@playwright/test'] ImportSpecifier[imported.name='test']",
					message: "Import test from fixtures/test.ts, which blocks the site's ads (see CLAUDE.md)."
				}
			]
		}
	},
	{
		// Reusable code is documented: every function, class and method in these folders has
		// JSDoc, and its tags stay accurate. Specs are documented by their titles and plans.
		files: [
			"api/**/*.ts",
			"config/**/*.ts",
			"fixtures/**/*.ts",
			"helpers/**/*.ts",
			"payloads/**/*.ts",
			"tests/ui/locators/**/*.ts",
			"tests/ui/pages/**/*.ts",
			"tests/ui/data/**/*.ts"
		],
		plugins: { jsdoc },
		settings: { jsdoc: { mode: "typescript" } },
		rules: {
			"jsdoc/require-jsdoc": [
				"error",
				{
					checkConstructors: false,
					require: { FunctionDeclaration: true, ClassDeclaration: true, MethodDefinition: true }
				}
			],
			"jsdoc/check-param-names": ["error", { checkDestructured: false }],
			"jsdoc/check-tag-names": "error",
			"jsdoc/no-types": "error"
		}
	},
	prettier
);
