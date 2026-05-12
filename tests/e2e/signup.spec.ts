import { test, expect } from "@playwright/test";

test("signup wizard — step 1 → step 2", async ({ page }) => {
  await page.goto("/signup");

  // Step 1 visible: account fields
  await expect(page.getByLabel(/Jouw naam/)).toBeVisible();
  await expect(page.getByLabel(/E-mailadres/)).toBeVisible();
  await expect(page.getByLabel(/Wachtwoord/)).toBeVisible();

  // Fill step 1
  await page.getByLabel(/Jouw naam/).fill("Marieke");
  await page.getByLabel(/E-mailadres/).fill("marieke@example.nl");
  await page.getByLabel(/Wachtwoord/).fill("hunter2hunter2");

  // Click Volgende → step 2
  await page.getByRole("button", { name: /Volgende/ }).click();

  // Step 2 visible: kid name field
  await expect(page.getByLabel(/Naam van je kind/)).toBeVisible();
});

test("signup — ?email= query prefills the email input", async ({ page }) => {
  await page.goto("/signup?email=prefilled%40example.nl");
  await expect(page.getByLabel(/E-mailadres/)).toHaveValue("prefilled@example.nl");
});
