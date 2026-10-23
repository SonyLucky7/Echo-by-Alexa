import { describe, it, expect } from "vitest";
import { executeWebSearch } from "@/lib/concierge/tools/webSearch";

describe("Web Research Engine", () => {
  it("handles empty query safely", async () => {
    const res = await executeWebSearch("");
    expect(res.results).toEqual([]);
    expect(res.sourceCount).toBe(0);
  });

  it("fetches structured web search results for a culinary topic", async () => {
    const res = await executeWebSearch("fruitwood smoking culinary", 3);
    expect(res.query).toBe("fruitwood smoking culinary");
    expect(Array.isArray(res.results)).toBe(true);
    expect(typeof res.summary).toBe("string");
  }, 10000);
});
