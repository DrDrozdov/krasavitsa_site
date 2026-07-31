import assert from "node:assert/strict";
import test from "node:test";
import {
  analyzeInciText,
  parseInciIngredients,
  sanitizeInciText,
} from "../../src/lib/inci-analyzer.ts";

test("the parser keeps parenthetical ingredient aliases together", () => {
  assert.deepEqual(
    parseInciIngredients("Ingredients: Aqua (Water), Glycerin; Niacinamide\nPanthenol"),
    ["Aqua (Water)", "Glycerin", "Niacinamide", "Panthenol"],
  );
});

test("the deterministic analyzer identifies actives and functional groups", () => {
  const result = analyzeInciText(
    "Aqua, Glycerin, Niacinamide, Panthenol, Ceramide NP, Phenoxyethanol",
  );

  assert.equal(result.ingredientCount, 6);
  assert.equal(result.recognizedCount, 6);
  assert.deepEqual(
    result.actives.map(({ name }) => name),
    ["Ниацинамид", "Пантенол", "Церамиды"],
  );
  assert.ok(result.functionalGroups.some(({ label }) => label === "Поддержка барьера"));
});

test("routine comparison gives soft retinoid and exfoliant guidance", () => {
  const result = analyzeInciText(
    "Aqua, Glycerin, Retinol, Squalane, Tocopherol",
    "Вечером использую BHA-тоник с салициловой кислотой.",
  );

  assert.ok(result.routineSignals.includes("BHA или салициловая кислота"));
  assert.ok(result.conflicts.some(({ id }) => id === "retinoid-exfoliant"));
  assert.ok(result.conflicts.every(({ suggestion }) => suggestion.length > 20));
});

test("niacinamide and vitamin C are not reported as a conflict", () => {
  const result = analyzeInciText(
    "Aqua, Niacinamide, Ascorbyl Glucoside, Glycerin, Panthenol",
    "Утром использую ниацинамид.",
  );

  assert.equal(result.conflicts.length, 0);
});

test("control characters and excessive input are bounded", () => {
  const dirty = `Aqua\u0000, Glycerin, ${"x".repeat(10_000)}`;
  const sanitized = sanitizeInciText(dirty);

  assert.equal(sanitized.includes("\u0000"), false);
  assert.equal(sanitized.length, 8_000);
});
