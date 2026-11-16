import { LazilessApp } from "~/app/_components/laziless-app";
import { JsonLd, breadcrumbLd, pageMetadata, softwareAppLd } from "~/lib/seo";

export const metadata = pageMetadata({
  title: "Try the demo",
  description:
    "Try Laziless free in your browser: get a random tiny task every 15 to 90 minutes, mark it done, and build a streak. No sign-up needed.",
  path: "/demo",
});

export default function DemoPage() {
  return (
    <>
      <JsonLd data={[softwareAppLd, breadcrumbLd([{ name: "Home", path: "/" }, { name: "Demo", path: "/demo" }])]} />
      <LazilessApp />
    </>
  );
}
