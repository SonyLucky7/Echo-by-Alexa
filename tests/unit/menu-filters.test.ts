import { describe, it, expect } from "vitest";

describe("Menu Filtering Logic", () => {
  const sampleDishes = [
    {
      id: "1",
      name: "Beetroot Tartare",
      dietaryFlags: ["VEGAN", "VEGETARIAN", "DAIRY_FREE"],
      spiceLevel: 1,
      basePriceMinor: 1800,
      categorySlug: "hearth-starters",
    },
    {
      id: "2",
      name: "Cedar Hearth Salmon",
      dietaryFlags: ["GLUTEN_FREE", "HALAL"],
      spiceLevel: 0,
      basePriceMinor: 3800,
      categorySlug: "coastal-fire",
    },
    {
      id: "3",
      name: "Heritage Grain Risotto",
      dietaryFlags: ["VEGETARIAN"],
      spiceLevel: 0,
      basePriceMinor: 2800,
      categorySlug: "heritage-grains",
    },
    {
      id: "4",
      name: "Cauliflower Steak",
      dietaryFlags: ["VEGAN", "VEGETARIAN", "GLUTEN_FREE", "DAIRY_FREE"],
      spiceLevel: 2,
      basePriceMinor: 2400,
      categorySlug: "open-fire-mains",
    },
  ];

  it("filters correctly by single dietary flag", () => {
    const vegetarian = sampleDishes.filter((d) => d.dietaryFlags.includes("VEGETARIAN"));
    expect(vegetarian).toHaveLength(3);
  });

  it("filters correctly by multiple dietary flags simultaneously", () => {
    const veganAndGlutenFree = sampleDishes.filter(
      (d) => d.dietaryFlags.includes("VEGAN") && d.dietaryFlags.includes("GLUTEN_FREE")
    );
    expect(veganAndGlutenFree).toHaveLength(1);
    expect(veganAndGlutenFree[0].name).toBe("Cauliflower Steak");
  });

  it("filters correctly by spice ceiling", () => {
    const mildOnly = sampleDishes.filter((d) => d.spiceLevel <= 1);
    expect(mildOnly).toHaveLength(3);
  });

  it("filters correctly by category slug", () => {
    const starters = sampleDishes.filter((d) => d.categorySlug === "hearth-starters");
    expect(starters).toHaveLength(1);
  });

  it("filters correctly by price ceiling", () => {
    const under30 = sampleDishes.filter((d) => d.basePriceMinor <= 3000);
    expect(under30).toHaveLength(3);
  });
});
