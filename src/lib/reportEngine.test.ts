import { describe, expect, it } from "vitest";
import {
  getWasteExplanationKey,
  getDeliveryKey,
  getMixingKey,
} from "./reportEngine";

describe("ReportEngine Deterministic Rules", () => {
  describe("getWasteExplanationKey", () => {
    it("returns 'low' for waste factors 5% or below", () => {
      expect(getWasteExplanationKey(0.05)).toBe("low");
      expect(getWasteExplanationKey(0.02)).toBe("low");
    });

    it("returns 'high' for waste factors above 15%", () => {
      expect(getWasteExplanationKey(0.16)).toBe("high");
      expect(getWasteExplanationKey(0.20)).toBe("high");
    });

    it("returns 'normal' for waste factors between 5% and 15% (inclusive)", () => {
      expect(getWasteExplanationKey(0.10)).toBe("normal");
      expect(getWasteExplanationKey(0.06)).toBe("normal");
      expect(getWasteExplanationKey(0.15)).toBe("normal");
    });
  });

  describe("getDeliveryKey", () => {
    it("returns 'truck' for concrete-slab with volumes above 1.5 cu yd", () => {
      expect(getDeliveryKey("concrete-slab", 1000, 1.6)).toBe("truck");
      expect(getDeliveryKey("concrete-slab", 8000, 2.0)).toBe("truck");
    });

    it("returns 'heavy' for loads exceeding 3,000 lbs if not concrete ready-mix", () => {
      expect(getDeliveryKey("drywall", 3500)).toBe("heavy");
      expect(getDeliveryKey("concrete-slab", 3200, 0.5)).toBe("heavy");
    });

    it("returns 'pickup' for safe loads below 3,000 lbs", () => {
      expect(getDeliveryKey("drywall", 1200)).toBe("pickup");
      expect(getDeliveryKey("concrete-slab", 2500, 0.4)).toBe("pickup");
    });
  });

  describe("getMixingKey", () => {
    it("returns 'concrete_heavy' for concrete-slab with more than 60 bags", () => {
      expect(getMixingKey("concrete-slab", 61)).toBe("concrete_heavy");
      expect(getMixingKey("concrete-slab", 120)).toBe("concrete_heavy");
    });

    it("returns 'concrete_medium' for concrete-slab with 21 to 60 bags", () => {
      expect(getMixingKey("concrete-slab", 21)).toBe("concrete_medium");
      expect(getMixingKey("concrete-slab", 45)).toBe("concrete_medium");
      expect(getMixingKey("concrete-slab", 60)).toBe("concrete_medium");
    });

    it("returns 'concrete_light' for concrete-slab with 20 or fewer bags", () => {
      expect(getMixingKey("concrete-slab", 20)).toBe("concrete_light");
      expect(getMixingKey("concrete-slab", 5)).toBe("concrete_light");
    });

    it("returns 'fallback' for non-concrete calculators", () => {
      expect(getMixingKey("drywall", 20)).toBe("fallback");
    });
  });
});
