export const SITE_URL = "https://www.rejournal.in";
export const SITE_NAME = "RE Journal";
export const SITE_DESCRIPTION =
  "RE Journal delivers high-quality real estate data, insights and econometric forecasts across India's office, retail, warehousing and residential markets.";

/** Pages on the live rejournal.in site that this redesign links out to (until they're rebuilt here). */
export const LINKS = {
  signIn: `${SITE_URL}/signin`,
  signUp: `${SITE_URL}/signup`,
  products: `${SITE_URL}/products`,
  product: (name: string) => `${SITE_URL}/products/${name.toLowerCase()}`,
  insights: `${SITE_URL}/insights`,
};
