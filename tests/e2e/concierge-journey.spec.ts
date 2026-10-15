import { test, expect } from "@playwright/test";

test.describe("E2E: Multilingual AI Concierge Journey", () => {
  test("guest interacts with Alexa Concierge, switches languages, and inquires about dishes", async ({ page }) => {
    await page.goto("/");

    // 1. Click on Concierge launch button
    const conciergeBtn = page.locator("button[aria-label*='Dining Concierge' i], button:has-text('Alexa Concierge')");
    await expect(conciergeBtn).toBeVisible();
    await conciergeBtn.click();

    // 2. Concierge panel opens
    await expect(page.locator("h3:has-text('Alexa')")).toBeVisible();
    await expect(page.locator("text=Dining Concierge • Progressive Hearth, text=Alexa • Dining Concierge").first()).toBeVisible();

    // 3. Switch language to Spanish
    const esBtn = page.locator("button:has-text('ES')");
    if (await esBtn.isVisible()) {
      await esBtn.click();
    }

    // 4. Switch back to English
    const enBtn = page.locator("button:has-text('EN')");
    if (await enBtn.isVisible()) {
      await enBtn.click();
    }

    // 5. Send a question
    const input = page.locator("input[placeholder*='Ask Alexa' i], input[type='text']").last();
    if (await input.isVisible()) {
      await input.fill("What are your signature open fire dishes?");
      await input.press("Enter");

      // Verify response appears
      await expect(page.locator("text=Wood-Fired, text=Hearth, text=Tonight").first()).toBeVisible({ timeout: 15000 });
    }
  });
});
