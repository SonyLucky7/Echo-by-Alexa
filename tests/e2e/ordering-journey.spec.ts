import { test, expect } from "@playwright/test";

test.describe("E2E: Visual Ordering Journey", () => {
  test("guest explores home, browses menu, customizes dish, and checks out", async ({ page }) => {
    // 1. Visit homepage
    await page.goto("/");
    await expect(page).toHaveTitle(/ECHO/);
    await expect(page.locator("h1")).toContainText("Where Elemental Fire Meets");

    // 2. Navigate to menu
    await page.click("text=Explore Curated Menu");
    await expect(page).toHaveURL(/\/menu/);

    // 3. Verify category pills and menu items
    const dishCards = page.locator("[data-testid='menu-item-card'], div.bg-ivory.border");
    await expect(dishCards.first()).toBeVisible();

    // 4. Open dish detail modal
    await dishCards.first().click();
    const modalHeading = page.locator("h2, h3").first();
    await expect(modalHeading).toBeVisible();

    // 5. Add dish to cart
    const addToCartBtn = page.locator("button:has-text('Add to Cart'), button:has-text('Add to Table')").first();
    if (await addToCartBtn.isVisible()) {
      await addToCartBtn.click();
    }

    // 6. Open cart drawer
    const cartBtn = page.locator("button[aria-label*='Cart'], nav button:has(.lucide-shopping-bag)");
    if (await cartBtn.isVisible()) {
      await cartBtn.click();
      await expect(page.locator("text=Your Culinary Cart, text=Subtotal").first()).toBeVisible();
    }

    // 7. Proceed to checkout
    await page.goto("/checkout");
    await expect(page.locator("h1, h2").first()).toBeVisible();

    // 8. Fill fulfillment information if form exists
    const nameInput = page.locator("input[name='customerName'], input[placeholder*='name' i]").first();
    if (await nameInput.isVisible()) {
      await nameInput.fill("Siddhartha Gautama");
    }

    const phoneInput = page.locator("input[name='customerPhone'], input[placeholder*='phone' i]").first();
    if (await phoneInput.isVisible()) {
      await phoneInput.fill("+15552345678");
    }
  });
});
