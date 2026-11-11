/**
 * Fails if a test has no id, shares its id with another test, or (for specs) has no
 * project tag and so would run in no project.
 *
 * Ids are numbers, unique across the repo, rendered in titles as "#0012" by
 * generateTestDescription. Playwright only rejects duplicate titles within one file,
 * so this lists every test in the repo and checks ids across all files.
 *
 * Run: npm run check:ids (also part of npm run lint)
 */
import { execFileSync } from "child_process";

interface Spec {
	title: string;
	file: string;
	line: number;
}

interface Suite {
	specs?: Spec[];
	suites?: Suite[];
}

const ID = /^#(\d{4,}) \|/;
const PROJECT_TAG = /(^|\s)@(smoke|api|ui)(\s|$)/;
const format = (id: number) => `#${String(id).padStart(4, "0")}`;

const output = execFileSync(
	"npx",
	["playwright", "test", "--list", "--reporter=json", "--config=scripts/list-all.config.ts"],
	{ encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }
);
const report = JSON.parse(output) as { suites: Suite[] };

/** Every spec, i.e. every test() call. */
function* specs(suite: Suite): Generator<Spec> {
	for (const spec of suite.specs ?? []) {
		yield spec;
	}
	for (const child of suite.suites ?? []) {
		yield* specs(child);
	}
}

const byId = new Map<number, string[]>();
const problems: string[] = [];
for (const suite of report.suites) {
	for (const spec of specs(suite)) {
		const where = `${spec.file}:${spec.line}`;
		const match = ID.exec(spec.title);
		if (!match?.[1]) {
			problems.push(`No test id (use generateTestDescription): ${where}  "${spec.title}"`);
			continue;
		}
		const id = Number(match[1]);
		byId.set(id, [...(byId.get(id) ?? []), where]);
		if (spec.file.endsWith(".spec.ts") && !PROJECT_TAG.test(spec.title)) {
			problems.push(`No @smoke, @api or @ui tag, so it runs in no project: ${where}  "${spec.title}"`);
		}
	}
}
for (const [id, places] of byId) {
	if (places.length > 1) {
		problems.push(`${format(id)} is used more than once:\n  ${places.join("\n  ")}`);
	}
}

if (problems.length) {
	console.error(problems.join("\n"));
	process.exit(1);
}
console.log(`${byId.size} test ids, all unique. Highest: ${format(Math.max(0, ...byId.keys()))}`);
