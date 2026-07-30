export type CommerceLink = {
  href: string;
  price?: number;
};

export type StoreResolver = (href: string) => string;

export type CommerceEvidence = {
  storeCount: number;
  pricedStoreCount: number;
};

const VERIFIED_PACKSHOT_CACHE =
  "public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000";
const FALLBACK_PACKSHOT_CACHE = "private, no-store, max-age=0";

function isObservedPrice(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

export function commerceEvidence(
  links: readonly CommerceLink[],
  resolveStore: StoreResolver,
): CommerceEvidence {
  const stores = new Set<string>();
  const pricedStores = new Set<string>();

  for (const link of links) {
    const store = resolveStore(link.href);
    if (!store) continue;
    stores.add(store);
    if (isObservedPrice(link.price)) pricedStores.add(store);
  }

  return {
    storeCount: stores.size,
    pricedStoreCount: pricedStores.size,
  };
}

/**
 * Publication requires one exact allow-listed product card with one observed
 * price. More stores remain preferable, but their temporary unavailability must
 * not erase an otherwise grounded recommendation.
 */
export function hasGroundedCommerce(
  links: readonly CommerceLink[],
  resolveStore: StoreResolver,
): boolean {
  const evidence = commerceEvidence(links, resolveStore);
  return evidence.storeCount >= 1 && evidence.pricedStoreCount >= 1;
}

export function orderGroundedCandidates<T extends { links: readonly CommerceLink[] }>(
  candidates: readonly T[],
  resolveStore: StoreResolver,
): T[] {
  return candidates
    .map((candidate, index) => ({
      candidate,
      index,
      evidence: commerceEvidence(candidate.links, resolveStore),
    }))
    .filter(({ evidence }) => evidence.storeCount >= 1 && evidence.pricedStoreCount >= 1)
    .sort(
      (left, right) =>
        right.evidence.pricedStoreCount - left.evidence.pricedStoreCount ||
        right.evidence.storeCount - left.evidence.storeCount ||
        left.index - right.index,
    )
    .map(({ candidate }) => candidate);
}

export function packshotCacheControl(verified: boolean): string {
  return verified ? VERIFIED_PACKSHOT_CACHE : FALLBACK_PACKSHOT_CACHE;
}
