import { describe, expect, it } from "vitest";
import { calculateElectricalSizing, getStandardBreaker } from "./electricalEngine";

describe("Electrical sizing calculations", () => {
  it("determines the correct standard breaker sizes", () => {
    expect(getStandardBreaker(12)).toBe(15);
    expect(getStandardBreaker(15)).toBe(15);
    expect(getStandardBreaker(16)).toBe(20);
    expect(getStandardBreaker(24.5)).toBe(25);
    expect(getStandardBreaker(48)).toBe(50);
  });

  it("applies the 125% continuous load factor correctly", () => {
    const result = calculateElectricalSizing({
      applianceKey: "custom",
      loadAmps: 16,
      volts: 120,
      isContinuous: true, // 16 * 1.25 = 20A continuous load
      distanceFt: 25,
      material: "copper",
      wiringMethod: "romex",
    });

    expect(result.continuousLoadAmps).toBe(20);
    expect(result.minBreakerSize).toBe(20);
    expect(result.baseWireSizeAWG).toBe("12"); // 20A requires 12 AWG Cu Romex
  });

  it("sizes basic copper Romex circuits correctly", () => {
    const result = calculateElectricalSizing({
      applianceKey: "dryer",
      loadAmps: 24,
      volts: 240,
      isContinuous: false, // 24A load
      distanceFt: 50,
      material: "copper",
      wiringMethod: "romex",
    });

    expect(result.minBreakerSize).toBe(25);
    expect(result.baseWireSizeAWG).toBe("10"); // 30A circuit -> 10 AWG copper
  });

  it("upsizes wire size automatically when voltage drop exceeds 3%", () => {
    // 50A load, 200 feet distance, copper conduit (75C column)
    const result = calculateElectricalSizing({
      applianceKey: "custom",
      loadAmps: 40,
      volts: 240,
      isContinuous: true, // 50A circuit
      distanceFt: 180, // long distance
      material: "copper",
      wiringMethod: "conduit_thhn",
    });

    expect(result.minBreakerSize).toBe(50);
    expect(result.baseWireSizeAWG).toBe("8"); // Base is 8 AWG for 50A
    expect(result.recommendedWireSizeAWG).toBe("6"); // Recommended wire should be upsized to 6 AWG due to distance
    expect(result.upsizedForDistance).toBe(true);
    expect(result.voltageDropPercent).toBeLessThanOrEqual(3.0);
  });

  it("correctly models conduit 75C ampacity gains for larger copper gauges", () => {
    const result = calculateElectricalSizing({
      applianceKey: "custom",
      loadAmps: 48,
      volts: 240,
      isContinuous: true, // 60A continuous load
      distanceFt: 40,
      material: "copper",
      wiringMethod: "conduit_thhn", // 75C conduit
    });

    expect(result.minBreakerSize).toBe(60);
    expect(result.baseWireSizeAWG).toBe("6"); // 6 AWG Cu at 75C is rated 65A (covers 60A)
  });
});
