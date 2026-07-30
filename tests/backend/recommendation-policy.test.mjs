import assert from "node:assert/strict";
import test from "node:test";
import {
  commerceEvidence,
  hasGroundedCommerce,
  orderGroundedCandidates,
  packshotCacheControl,
} from "../../src/lib/recommendation-policy.ts";
import { CURATED_COMMERCE } from "../../src/lib/curated-commerce.ts";

const resolveStore = (href) => {
  try {
    const host = new URL(href).hostname.replace(/^www\./, "");
    if (host.endsWith("wildberries.ru")) return "wildberries";
    if (host.endsWith("ozon.ru")) return "ozon";
    if (host.endsWith("market.yandex.ru")) return "yandex";
  } catch {
    return "";
  }
  return "";
};

test("one allow-listed direct card with an observed price is publishable", () => {
  const links = [{
    href: "https://www.wildberries.ru/catalog/665809989/detail.aspx",
    price: 969,
  }];

  assert.deepEqual(commerceEvidence(links, resolveStore), {
    storeCount: 1,
    pricedStoreCount: 1,
  });
  assert.equal(hasGroundedCommerce(links, resolveStore), true);
});

test("unpriced, malformed, and non-allow-listed links never satisfy grounding", () => {
  assert.equal(
    hasGroundedCommerce(
      [{ href: "https://www.ozon.ru/product/exact-card/" }],
      resolveStore,
    ),
    false,
  );
  assert.equal(
    hasGroundedCommerce(
      [{ href: "https://example.com/product/1", price: 1500 }],
      resolveStore,
    ),
    false,
  );
  assert.equal(
    hasGroundedCommerce(
      [{ href: "not-a-url", price: 1500 }],
      resolveStore,
    ),
    false,
  );
});

test("multi-store evidence is preferred without manufacturing or mutating links", () => {
  const single = {
    name: "Single",
    links: [{ href: "https://www.wildberries.ru/catalog/1/detail.aspx", price: 900 }],
  };
  const multiple = {
    name: "Multiple",
    links: [
      { href: "https://www.wildberries.ru/catalog/2/detail.aspx", price: 1000 },
      { href: "https://www.ozon.ru/product/2/", price: 1100 },
    ],
  };
  const ungrounded = {
    name: "No price",
    links: [{ href: "https://www.ozon.ru/product/3/" }],
  };
  const originalLinks = structuredClone([single.links, multiple.links, ungrounded.links]);

  const ordered = orderGroundedCandidates([single, ungrounded, multiple], resolveStore);

  assert.deepEqual(ordered.map(({ name }) => name), ["Multiple", "Single"]);
  assert.deepEqual([single.links, multiple.links, ungrounded.links], originalLinks);
});

test("fallback packshots are retried instead of being cached for days", () => {
  const fallback = packshotCacheControl(false);
  assert.match(fallback, /\bno-store\b/);
  assert.doesNotMatch(fallback, /s-maxage|stale-while-revalidate/);

  const verified = packshotCacheControl(true);
  assert.match(verified, /s-maxage=604800/);
});

test("hair and perfume reserves each contain at least three grounded exact cards", () => {
  for (const mode of ["hair", "perfume"]) {
    const products = Object.entries(CURATED_COMMERCE[mode]);
    assert.ok(products.length >= 3, `${mode} reserve must contain at least three products`);

    for (const [name, links] of products) {
      assert.ok(name.length > 4);
      assert.equal(hasGroundedCommerce(links, resolveStore), true);
      for (const link of links) {
        assert.match(
          link.href,
          /^https:\/\/www\.wildberries\.ru\/catalog\/\d+\/detail\.aspx$/,
        );
        assert.ok(Number.isFinite(link.price) && link.price > 0);
      }
    }
  }
});
