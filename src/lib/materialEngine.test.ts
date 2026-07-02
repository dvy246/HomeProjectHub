import { describe, expect, it } from "vitest";
import {
  applyWasteFactor,
  calculateConcreteBags,
  calculatePackaging,
  estimateConcreteWeightLbs,
} from "./materialEngine";

describe("material engine", () => {
  it("applies waste factors", () => {
    expect(applyWasteFactor(100, 0.1)).toBe(110.00000000000001);
  });

  it("rounds packaging up to whole units", () => {
    expect(calculatePackaging(10, 3)).toBe(4);
    expect(calculatePackaging(10, 0)).toBe(0);
  });

  it("calculates concrete bags by published yield assumptions", () => {
    expect(calculateConcreteBags(27, "80lb")).toBe(45);
    expect(calculateConcreteBags(27, "60lb")).toBe(60);
    expect(calculateConcreteBags(27, "50lb")).toBe(72);
    expect(calculateConcreteBags(27, "40lb")).toBe(90);
  });

  it("estimates dry concrete weight from volume", () => {
    expect(estimateConcreteWeightLbs(10)).toBe(1500);
  });
});
