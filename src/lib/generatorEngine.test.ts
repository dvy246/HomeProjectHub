import { describe, expect, it } from "vitest";
import { calculateGeneratorSize } from "./generatorEngine";

describe("Generator Sizing load calculations", () => {
  it("calculates baseline continuous and surge watts correctly", () => {
    // Select Refrigerator (700W run, 1500W surge) and LED lights (100W run, 0W surge)
    const results = calculateGeneratorSize(["refrigerator", "lights_led"]);

    expect(results.totalRunningWatts).toBe(800); // 700 + 100
    expect(results.maxStartingSurgeWatts).toBe(1500); // Refrigerator has max starting surge of 1500
    expect(results.requiredContinuousWatts).toBe(800);
    expect(results.requiredSurgeWatts).toBe(2300); // 800 + 1500

    // Safety buffer 1.15
    expect(results.recommendedContinuousRating).toBe(Math.round(800 * 1.15)); // 920
    expect(results.recommendedSurgeRating).toBe(Math.round(2300 * 1.15)); // 2645
    expect(results.generatorClass).toBe("inverter"); // Under 2200W recommended continuous
  });

  it("handles empty selection gracefully", () => {
    const results = calculateGeneratorSize([]);

    expect(results.totalRunningWatts).toBe(0);
    expect(results.maxStartingSurgeWatts).toBe(0);
    expect(results.requiredContinuousWatts).toBe(0);
    expect(results.requiredSurgeWatts).toBe(0);
    expect(results.recommendedContinuousRating).toBe(0);
    expect(results.recommendedSurgeRating).toBe(0);
    expect(results.generatorClass).toBe("inverter");
  });

  it("recommends standby class for heavy multi-appliance loads", () => {
    // Select Central AC (3500W run, 2500W surge), Electric Water Heater (4500W run, 0W surge), and Well Pump (1000W run, 1500W surge)
    const results = calculateGeneratorSize(["central_ac_3ton", "water_heater_elec", "well_pump"]);

    expect(results.totalRunningWatts).toBe(9000); // 3500 + 4500 + 1000
    expect(results.maxStartingSurgeWatts).toBe(2500); // Central AC is 2500
    expect(results.requiredSurgeWatts).toBe(11500); // 9000 + 2500

    // Recommended continuous is 9000 * 1.15 = 10350W
    expect(results.recommendedContinuousRating).toBe(10350);
    expect(results.generatorClass).toBe("standby"); // Above 8500W
  });
});
