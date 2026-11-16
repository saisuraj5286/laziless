import { features, faqs, nav, site } from "~/content/site";
import { absoluteUrl } from "~/lib/seo";

/**
 * /llms.txt: a plain-text summary of the site for AI assistants and answer
 * engines (see llmstxt.org). Generated from the same content as the pages.
 */
export const dynamic = "force-static";

export function GET() {
  const body = [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    "## Pages",
    `- [Home](${absoluteUrl("/")}): overview of the tiny-task approach`,
    `- [Try the demo](${absoluteUrl("/demo")}): free web version, no sign-up`,
    ...nav.map((n) => `- [${n.label}](${absoluteUrl(n.href)})`),
    "",
    "## Features",
    ...features.map((f) => `- ${f.title}: ${f.body}`),
    "",
    "## FAQ",
    ...faqs.flatMap((f) => [`### ${f.q}`, f.a, ""]),
  ].join("\n");

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
