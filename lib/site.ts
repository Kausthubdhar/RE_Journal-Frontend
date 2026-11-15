/** The client's current live website: links out to it, and it identifies the organisation. */
export const LIVE_SITE_URL = "https://www.rejournal.in";

/**
 * Where this build itself is served, used for canonical URLs and link-preview images.
 * - Real launch: set NEXT_PUBLIC_SITE_URL=https://www.rejournal.in in the hosting settings.
 * - Vercel demo: falls back to the project's own *.vercel.app address automatically.
 * - Locally: http://localhost:3000.
 */
const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? (vercelHost ? `https://${vercelHost}` : "http://localhost:3000");

/** Search engines may index this build only when it is the real site, never a demo copy. */
export const INDEXABLE = SITE_URL === LIVE_SITE_URL;

export const SITE_NAME = "RE Journal";
export const SITE_DESCRIPTION =
  "RE Journal delivers high-quality real estate data, insights and econometric forecasts across India's office, retail, warehousing and residential markets.";

/** Pages on the live rejournal.in site that this redesign links out to (until they're rebuilt here). */
export const LINKS = {
  signIn: `${LIVE_SITE_URL}/signin`,
  signUp: `${LIVE_SITE_URL}/signup`,
  products: `${LIVE_SITE_URL}/products`,
  product: (name: string) => `${LIVE_SITE_URL}/products/${name.toLowerCase()}`,
  insights: `${LIVE_SITE_URL}/insights`,
};
