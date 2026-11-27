import { describe, expect, it } from "vitest";
import { ensureReadableText, getContrastRatio } from "@/lib/theme-contrast";

describe("theme contrast guard", () => {
  it("keeps high-contrast text untouched", () => {
    const res = ensureReadableText("#090a0f", "#ffffff");
    expect(res.color).toBe("#ffffff");
    expect(res.adjusted).toBe(false);
    expect(res.ratio).toBeGreaterThanOrEqual(4.5);
  });

  it("auto-adjusts dark text on dark background to readable white", () => {
    const res = ensureReadableText("#090a0f", "#111111");
    expect(res.adjusted).toBe(true);
    expect(res.color).toBe("#ffffff");
    expect(getContrastRatio("#090a0f", res.color)).toBeGreaterThanOrEqual(4.5);
  });

  it("auto-adjusts white text on light background to readable dark slate", () => {
    const res = ensureReadableText("#f1f5f9", "#ffffff");
    expect(res.adjusted).toBe(true);
    expect(res.color).toBe("#0f172a");
    expect(getContrastRatio("#f1f5f9", res.color)).toBeGreaterThanOrEqual(4.5);
  });
});
