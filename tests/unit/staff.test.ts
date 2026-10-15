import { describe, it, expect } from "vitest";
import { getConfig } from "@/lib/config";
import { isValidTransition } from "@/lib/orders/state-machine";
import { FulfillmentStatus } from "@/types";
import { db } from "@/lib/db";

describe("Staff Operations Subsystem", () => {
  it("defaults staff password to echo-hearth-pass", () => {
    const config = getConfig();
    expect(config.staffPassword).toBe("echo-hearth-pass");
  });

  it("permits canonical kitchen flow state transitions", () => {
    // CONFIRMED -> PREPARING
    expect(isValidTransition(FulfillmentStatus.CONFIRMED, FulfillmentStatus.PREPARING)).toBe(true);
    // PREPARING -> READY
    expect(isValidTransition(FulfillmentStatus.PREPARING, FulfillmentStatus.READY)).toBe(true);
    // READY -> COMPLETED
    expect(isValidTransition(FulfillmentStatus.READY, FulfillmentStatus.COMPLETED)).toBe(true);
    // READY -> OUT_FOR_DELIVERY
    expect(isValidTransition(FulfillmentStatus.READY, FulfillmentStatus.OUT_FOR_DELIVERY)).toBe(true);
    // OUT_FOR_DELIVERY -> COMPLETED
    expect(isValidTransition(FulfillmentStatus.OUT_FOR_DELIVERY, FulfillmentStatus.COMPLETED)).toBe(true);
  });

  it("prevents skipping kitchen preparation directly to completed", () => {
    expect(isValidTransition(FulfillmentStatus.CONFIRMED, FulfillmentStatus.COMPLETED)).toBe(false);
  });

  it("database supports toggling isAvailable for dish 86", async () => {
    const dish = await db.menuItem.findFirst();
    expect(dish).toBeDefined();

    const initial = dish!.isAvailable;
    const toggled = await db.menuItem.update({
      where: { id: dish!.id },
      data: { isAvailable: !initial },
    });
    expect(toggled.isAvailable).toBe(!initial);

    // Revert back
    const restored = await db.menuItem.update({
      where: { id: dish!.id },
      data: { isAvailable: initial },
    });
    expect(restored.isAvailable).toBe(initial);
  });
});
