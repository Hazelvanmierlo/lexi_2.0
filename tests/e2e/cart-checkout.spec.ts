import { test, expect } from "@playwright/test";

test.describe("Cart + checkout flow", () => {
  test("anonymous user can add a workbook, view cart, fill checkout, see thank-you", async ({
    page,
  }) => {
    await page.goto("/shop/boek/taal-groep-3");

    // Add to cart via primary detail-page CTA
    await page.locator("[data-test='add-to-cart-detail']").click();

    // Cart pill (bottom-right) appears with count 1
    await expect(page.locator("a[href='/winkelmand']").first()).toBeVisible();

    // Navigate to /winkelmand
    await page.goto("/winkelmand");
    await expect(page.locator("[data-test='cart-line-workbook']")).toHaveCount(1);
    await expect(page.locator("[data-test='cart-total']")).toBeVisible();

    // Go to checkout
    await page.locator("[data-test='cart-checkout']").click();
    await expect(page).toHaveURL(/\/afrekenen/);

    // Fill the form
    await page.locator("[data-test='field-name'] input").fill("Sara Jansen");
    await page.locator("[data-test='field-email'] input").fill("sara@example.com");
    await page.locator("[data-test='field-line1'] input").fill("Hoofdstraat 1");
    await page.locator("[data-test='field-postcode'] input").fill("1011 AB");
    await page.locator("[data-test='field-city'] input").fill("Amsterdam");

    // Submit
    await page.locator("[data-test='submit-order']").click();

    // Lands on thank-you page
    await expect(page).toHaveURL(/\/bestelling\/.*\/bedankt/);
    await expect(page.locator("[data-test='order-number']")).toBeVisible();
    await expect(page.getByText("Bedankt voor je bestelling!")).toBeVisible();
  });

  test("empty cart shows empty state", async ({ page }) => {
    // Clear cart via localStorage then visit
    await page.goto("/shop");
    await page.evaluate(() => localStorage.removeItem("lexi_cart_v1"));
    await page.goto("/winkelmand");
    await expect(page.locator("[data-test='cart-empty']")).toBeVisible();
  });

  test("bad postcode is rejected at checkout", async ({ page }) => {
    // First add an item so checkout doesn't redirect on empty cart
    await page.goto("/shop/boek/taal-groep-3");
    await page.locator("[data-test='add-to-cart-detail']").click();
    await page.goto("/afrekenen");

    await page.locator("[data-test='field-name'] input").fill("Sara Jansen");
    await page.locator("[data-test='field-email'] input").fill("sara@example.com");
    await page.locator("[data-test='field-line1'] input").fill("Hoofdstraat 1");
    await page.locator("[data-test='field-postcode'] input").fill("ABCDEF");
    await page.locator("[data-test='field-city'] input").fill("Amsterdam");
    await page.locator("[data-test='submit-order']").click();

    // Error message appears
    await expect(page.getByText("Postcode is ongeldig", { exact: false })).toBeVisible();
  });

  test("uitblinker signup adds subscription line item and redirects to cart", async ({
    page,
  }) => {
    await page.goto("/shop");
    await page.evaluate(() => localStorage.removeItem("lexi_cart_v1"));
    await page.goto("/shop/uitblinker/aanmelden");

    await page.locator("[data-test='ub-kidname'] input").fill("Sara");
    // TAAL is default-checked
    await page.locator("[data-test='ub-shipname'] input").fill("Lev Jansen");
    await page.locator("[data-test='ub-shipline1'] input").fill("Hoofdstraat 1");
    await page.locator("[data-test='ub-shippostcode'] input").fill("1011 AB");
    await page.locator("[data-test='ub-shipcity'] input").fill("Amsterdam");
    await page.locator("[data-test='ub-submit']").click();

    await expect(page).toHaveURL(/\/winkelmand/);
    await expect(page.locator("[data-test='cart-line-uitblinker']")).toBeVisible();
  });
});
