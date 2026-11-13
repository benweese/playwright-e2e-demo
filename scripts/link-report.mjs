// Adds a bar linking back to benweese.com and code.benweese.com to the top of the HTML report
// before CI publishes it to Pages. Playwright's reporter has no option for a header link.
//
//   node scripts/link-report.mjs [reportDir]     (default playwright-report)
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const file = path.join(process.argv[2] ?? "playwright-report", "index.html");
const MARKER = 'id="bw-site-bar"';

const bar = `<nav ${MARKER} aria-label="Ben Weese" style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:.25rem 1.25rem;padding:.6rem 1rem;background:#141414;border-bottom:1px solid #333;font:600 14px/1.5 system-ui,-apple-system,'Segoe UI',Roboto,sans-serif">
<a href="https://benweese.com/" style="color:#ff7a1a;text-underline-offset:.2em">Ben Weese · benweese.com</a>
<span style="color:#a0a0a0">playwright-e2e-demo test report ·
<a href="https://code.benweese.com/" style="color:#e8e6e3;text-underline-offset:.2em">All projects</a> ·
<a href="https://github.com/benweese/playwright-e2e-demo" style="color:#e8e6e3;text-underline-offset:.2em">Source</a></span>
</nav>`;

const html = await readFile(file, "utf8");
if (html.includes(MARKER)) {
	console.log(`${file} already links back`);
} else if (!html.includes("<body>")) {
	throw new Error(`${file} has no <body> tag; the report format changed`);
} else {
	await writeFile(file, html.replace("<body>", `<body>\n${bar}`));
	console.log(`Added the site bar to ${file}`);
}
