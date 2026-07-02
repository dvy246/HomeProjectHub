import { describe, expect, it } from "vitest";
import {
  calculateCircleArea,
  calculateRectArea,
  calculateVolume,
  convertLength,
  cuFeetToCuYards,
  cuYardsToCuFeet,
  subtractOpenings,
} from "./geometry";

describe("geometry utilities", () => {
  it("calculates rectangular area and volume", () => {
    expect(calculateRectArea(10, 12)).toBe(120);
    expect(calculateVolume(120, 4 / 12)).toBeCloseTo(40, 5);
  });

  it("converts cubic feet and cubic yards", () => {
    expect(cuFeetToCuYards(27)).toBe(1);
    expect(cuYardsToCuFeet(1.5)).toBe(40.5);
  });

  it("converts common length units", () => {
    expect(convertLength(12, "in", "ft")).toBe(1);
    expect(convertLength(1, "yd", "ft")).toBe(3);
    expect(convertLength(1, "m", "ft")).toBeCloseTo(3.28084, 5);
  });

  it("calculates circular area", () => {
    expect(calculateCircleArea(2)).toBeCloseTo(Math.PI * 4, 5);
  });

  it("subtracts openings without returning negative area", () => {
    expect(subtractOpenings(100, [{ type: "door", count: 1 }])).toBe(79);
    expect(subtractOpenings(10, [{ type: "window", count: 2 }])).toBe(0);
  });
});
