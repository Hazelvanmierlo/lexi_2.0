import { test, expect } from "@playwright/test";

test("shop — sections + workbooks + cart pill visible", async ({ page }) => {
  await page.goto("/shop");
  await expect(page.getByRole("heading", { name: /Boeken en digitaal oefenen/ })).toBeVisible();
  await expect(page.getByText("Lexi.kids Maandelijks")).toBeVisible();
  await expect(page.getByText("Lexi.kids Jaarlijks")).toBeVisible();
  await expect(page.getByText(/Compleet pakket groep 3-4/)).toBeVisible();
  await expect(page.getByText("Tafels van 1 t/m 10")).toBeVisible();
  await expect(page.getByLabel(/Winkelmandje/)).toBeVisible();
});
