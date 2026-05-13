import { test, expect } from "@playwright/test";

test("/shop shows 24 workbooks + Uitblinker hero", async ({ page }) => {
  await page.goto("/shop");
  await expect(page.getByText("Uitblinker", { exact: false }).first()).toBeVisible();
  await expect(page.locator("[data-test='workbook-card']")).toHaveCount(24);
  await expect(page.getByLabel(/Winkelmandje/)).toBeVisible();
});

test("filtering by ?subject=taal shows 8 workbooks", async ({ page }) => {
  await page.goto("/shop?subject=taal");
  await expect(page.locator("[data-test='workbook-card']")).toHaveCount(8);
});

test("filtering by ?subject=rekenen&groep=3 shows 1 workbook", async ({ page }) => {
  await page.goto("/shop?subject=rekenen&groep=3");
  await expect(page.locator("[data-test='workbook-card']")).toHaveCount(1);
});

test("/shop/boek/taal-groep-3 renders detail page", async ({ page }) => {
  await page.goto("/shop/boek/taal-groep-3");
  await expect(page.locator("h1")).toContainText("Taal groep 3");
  await expect(page.getByText("Specificaties")).toBeVisible();
  await expect(page.getByText("Over dit boek")).toBeVisible();
});

test("/shop/uitblinker loads", async ({ page }) => {
  await page.goto("/shop/uitblinker");
  await expect(
    page.getByText("Een werkboek op maat. Elke maand in je brievenbus."),
  ).toBeVisible();
});

test("/word-lid shows 3 tier cards", async ({ page }) => {
  await page.goto("/word-lid");
  await expect(page.locator("[data-test='tier-card']")).toHaveCount(3);
});
