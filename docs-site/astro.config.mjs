// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import mermaid from "astro-mermaid";

const REPO = "https://github.com/NhatTrung224/AgriBatch_Pay";
const APP = "https://agribatchpay-production.up.railway.app";

export default defineConfig({
  site: "https://nhattrung224.github.io",
  base: "/AgriBatch_Pay",
  trailingSlash: "always",

  integrations: [
    // Must come before starlight: it swaps ```mermaid blocks out before
    // Expressive Code claims them as ordinary syntax-highlighted code.
    mermaid({ theme: "forest", autoTheme: true }),
    starlight({
      title: "AgriBatch Pay",
      description:
        "Settling a crop harvest across many smallholder farmers: batch registry, farmer lots, quality confirmation and payout approval, recorded on Stellar testnet.",
      tagline: "One harvest, many farmers, one settlement everyone can check.",

      social: [{ icon: "github", label: "GitHub", href: REPO }],

      editLink: { baseUrl: `${REPO}/edit/main/docs-site/` },

      lastUpdated: true,

      customCss: ["./src/styles/custom.css"],

      credits: false,

      sidebar: [
        {
          label: "Overview",
          items: [
            { label: "The settlement problem", slug: "overview/problem" },
            { label: "How AgriBatch Pay works", slug: "overview/how-it-works" },
            { label: "What it does and does not do", slug: "overview/scope" },
            { label: "Who uses it", slug: "overview/actors" },
          ],
        },
        {
          label: "Using the platform",
          items: [
            { label: "Connect a wallet", slug: "using/wallets" },
            { label: "Register a batch", slug: "using/register-a-batch" },
            { label: "Add farmer lots", slug: "using/farmer-lots" },
            { label: "Confirm quality", slug: "using/confirm-quality" },
            { label: "Fund and approve settlement", slug: "using/settlement" },
            { label: "Watch the event stream", slug: "using/events" },
          ],
        },
        {
          label: "Under the hood",
          items: [
            { label: "Architecture", slug: "internals/architecture" },
            { label: "Batch lifecycle", slug: "internals/lifecycle" },
            { label: "Contracts", slug: "internals/contracts" },
            { label: "Contract invocation path", slug: "internals/invocation" },
            { label: "Database schema", slug: "internals/schema" },
            { label: "HTTP API", slug: "internals/api" },
          ],
        },
        {
          label: "Operating it",
          items: [
            { label: "Install and run", slug: "operate/install" },
            { label: "Environment", slug: "operate/environment" },
            { label: "Database migrations", slug: "operate/database" },
            { label: "Deploying", slug: "operate/deploy" },
            { label: "Health checks", slug: "operate/health" },
            { label: "Tests and CI", slug: "operate/testing" },
          ],
        },
        {
          label: "Testnet evidence",
          items: [{ label: "Deployment and transactions", slug: "evidence/testnet" }],
        },
      ],
    }),
  ],
});
