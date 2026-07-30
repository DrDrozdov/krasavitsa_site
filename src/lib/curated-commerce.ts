export type CuratedCommerceMode = "hair" | "perfume";

export type CuratedMarketplaceLink = {
  label: "Wildberries";
  href: string;
  kind: "marketplace";
  price: number;
  currency: "RUB";
};

const wildberries = (id: number, price: number): CuratedMarketplaceLink => ({
  label: "Wildberries",
  href: `https://www.wildberries.ru/catalog/${id}/detail.aspx`,
  kind: "marketplace",
  price,
  currency: "RUB",
});

/**
 * Exact cards and observed prices checked before publication of this release.
 * Runtime verification still refreshes the price and rejects an identity
 * mismatch; these entries provide a grounded reserve when public search engines
 * or extra stores are temporarily unavailable.
 */
export const CURATED_COMMERCE: Record<
  CuratedCommerceMode,
  Record<string, readonly CuratedMarketplaceLink[]>
> = {
  hair: {
    "Lador Dermatical Hair-Loss Shampoo": [wildberries(665809989, 969)],
    "CHI 44 Iron Guard Thermal Protection Spray": [wildberries(264450307, 6164)],
    "Lador Wonder Balm": [wildberries(340852585, 1113)],
    "OLLIN Professional Perfect Hair 15 in 1 Cream Spray 100 ml": [wildberries(261092108, 265)],
  },
  perfume: {
    "Calvin Klein CK One Eau de Toilette": [wildberries(1135922372, 4937)],
    "Lalique Encre Noire Eau de Toilette 100 ml Tester": [wildberries(303552798, 4513)],
    "Montblanc Signature Eau de Parfum 90 ml": [wildberries(90633254, 7263)],
  },
};

export function curatedCommerceLinks(
  mode: CuratedCommerceMode,
  productName: string,
): CuratedMarketplaceLink[] {
  return (CURATED_COMMERCE[mode][productName] ?? []).map((link) => ({ ...link }));
}
