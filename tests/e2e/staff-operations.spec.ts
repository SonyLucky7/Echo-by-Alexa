import { test, expect } from "@playwright/test";

test.describe("E2E: Staff Operations & Kitchen Kanban", () => {
  test("staff authenticates with passkey, views live kanban, and manages dish 86", async ({ page }) => {
    // 1. Visit staff operations
    await page.goto("/staff/orders");

    // 2. Enter passkey
    const passInput = page.locator("input[type='password']");
    if (await passInput.isVisible()) {
      await passInput.fill("echo-hearth-pass");
      await page.click("button:has-text('Enter Hearth Dashboard')");
    }

    // 3. Verify Kitchen Kanban is displayed
    await expect(page.locator("h2:has-text('Kitchen Live Queue')")).toBeVisible();
    await expect(page.locator("text=Incoming Tickets, text=On the Hearth").first()).toBeVisible();

    // 4. Navigate to Dish 86 Toggle
    await page.click("text=Dish 86 Toggle");
    await expect(page).toHaveURL(/\/staff\/menu/);
    await expect(page.locator("h2:has-text('Menu Availability & 86 Management')")).toBeVisible();
  });
});
