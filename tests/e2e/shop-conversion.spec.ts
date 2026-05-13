import { test, expect } from "@playwright/test";

/**
 * Conversion-pass features (spec 2026-05-13-lexi-shop-conversion-pass-design):
 * - Cart drawer auto-opens on add; backdrop click + Esc close
 * - Filter sidebar visible on desktop; mobile shows the Filter trigger
 * - Sort dropdown changes URL
 * - Breadcrumb on book detail has 5 segments
 * - "Klanten kochten ook" renders
 * - Sticky mobile add-to-cart bar visible on mobile only
 */

test.describe("Cart drawer", () => {
  test("opens automatically when a workbook is added", async ({ page }) => {
    await page.goto("/shop");
    await page.locator("[data-test='workbook-card']").first().locator("[data-test='add-to-cart']").click();
    await expect(page.locator("[data-test='cart-drawer']")).toBeVisible();
  });

  test("backdrop click closes drawer", async ({ page }) => {
    await page.goto("/shop");
    await page.locator("[data-test='workbook-card']").first().locator("[data-test='add-to-cart']").click();
    await expect(page.locator("[data-test='cart-drawer']")).toBeVisible();
    await page.getByLabel("Sluit winkelmand").first().click();
    await expect(page.locator("[data-test='cart-drawer']")).toBeHidden();
  });

  test("Esc key closes drawer", async ({ page }) => {
    await page.goto("/shop");
    await page.locator("[data-test='workbook-card']").first().locator("[data-test='add-to-cart']").click();
    await expect(page.locator("[data-test='cart-drawer']")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("[data-test='cart-drawer']")).toBeHidden();
  });

  test("'Verder winkelen' closes the drawer without navigation", async ({ page }) => {
    await page.goto("/shop");
    await page.locator("[data-test='workbook-card']").first().locator("[data-test='add-to-cart']").click();
    await expect(page.locator("[data-test='cart-drawer']")).toBeVisible();
    await page.locator("[data-test='cart-drawer-continue']").click();
    await expect(page.locator("[data-test='cart-drawer']")).toBeHidden();
    await expect(page).toHaveURL(/\/shop/);
  });

  test("'Naar afrekenen' navigates to /afrekenen", async ({ page }) => {
    await page.goto("/shop");
    await page.locator("[data-test='workbook-card']").first().locator("[data-test='add-to-cart']").click();
    await page.locator("[data-test='cart-drawer-checkout']").click();
    await expect(page).toHaveURL(/\/afrekenen/);
  });
});

test.describe("Filter sidebar + sort", () => {
  test("desktop: sidebar is visible at >= md viewport", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/shop");
    await expect(page.locator("[data-test='filter-sidebar']")).toBeVisible();
  });

  test("mobile: filter trigger button appears (md:hidden sidebar)", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto("/shop");
    await expect(page.locator("[data-test='filter-mobile-trigger']")).toBeVisible();
  });

  test("sort dropdown writes ?sort=price-desc", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/shop");
    await page.locator("[data-test='sort-select']").selectOption("price-desc");
    await expect(page).toHaveURL(/sort=price-desc/);
  });

  test("subject checkbox writes ?subject=taal", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/shop");
    await page.locator("[data-test='filter-subject-taal']").check();
    await expect(page).toHaveURL(/subject=taal/);
  });
});

test.describe("Detail page conversion features", () => {
  test("breadcrumb on book detail has 5 segments", async ({ page }) => {
    await page.goto("/shop/boek/taal-groep-3");
    const items = page.locator("[data-test='breadcrumb'] li");
    await expect(items).toHaveCount(5);
  });

  test("'Klanten kochten ook' renders with up to 3 cards", async ({ page }) => {
    await page.goto("/shop/boek/taal-groep-3");
    await expect(page.getByText("Klanten kochten ook")).toBeVisible();
    // The section is one of multiple <RelatedBooks> blocks; ensure at least 3 cards in it.
    const section = page.locator("[data-test='related-books']", { hasText: "Klanten kochten ook" });
    await expect(section.locator("[data-test='workbook-card']")).toHaveCount(3);
  });

  test("sticky add-to-cart bar visible on mobile, hidden on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto("/shop/boek/taal-groep-3");
    await expect(page.locator("[data-test='sticky-add-to-cart']")).toBeVisible();

    await page.setViewportSize({ width: 1280, height: 800 });
    // md:hidden — element exists in DOM but isn't visible.
    await expect(page.locator("[data-test='sticky-add-to-cart']")).toBeHidden();
  });
});

test.describe("Breadcrumb across pages", () => {
  test("/winkelmand renders Lexi > Winkelmand", async ({ page }) => {
    await page.goto("/winkelmand");
    await expect(page.locator("[data-test='breadcrumb']")).toContainText("Winkelmand");
  });

  test("/hulp renders Lexi > Klantenservice", async ({ page }) => {
    await page.goto("/hulp");
    await expect(page.locator("[data-test='breadcrumb']")).toContainText("Klantenservice");
  });
});
