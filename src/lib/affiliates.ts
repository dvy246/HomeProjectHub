export const AFFILIATE_CONFIG = {
  lowes: {
    baseUrl: "https://www.lowes.com",
    tag: import.meta.env.PUBLIC_LOWES_AFFILIATE_ID || "",
  },
  amazon: {
    baseUrl: "https://www.amazon.com",
    tag: import.meta.env.PUBLIC_AMAZON_ASSOCIATES_TAG || "",
  },
};

export function buildAffiliateUrl(store: "lowes" | "amazon", path: string): string {
  const config = AFFILIATE_CONFIG[store];
  const separator = path.includes("?") ? "&" : "?";

  if (store === "lowes" && config.tag) {
    return `${config.baseUrl}${path}${separator}affcil=${config.tag}`;
  }
  if (store === "amazon" && config.tag) {
    return `${config.baseUrl}${path}${separator}tag=${config.tag}`;
  }

  return `${config.baseUrl}${path}`;
}
