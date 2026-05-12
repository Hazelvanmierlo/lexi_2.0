import { test, expect } from "@playwright/test";

test("landing page — region switch + FAQ + hero CTA", async ({ page, context }) => {
  // Start without any locale cookie — defaults to nl-NL
  await context.clearCookies();

  await page.goto("/");

  // NL default: subjects lead mentions "groep" and "1 t/m 8"
  await expect(page.getByText(/Voor groep 1 t\/m 8/)).toBeVisible();

  // Switch to BE via the region picker
  await page.getByRole("button", { name: /Kies regio/i }).click();
  await page.getByRole("button", { name: /België/i }).click();

  // After revalidation, BE copy should be visible
  await expect(page.getByText(/Voor leerjaar 1 t\/m 6/)).toBeVisible();
  await expect(page.getByText(/Lexi\.kids — Antwerpen/)).toBeVisible();

  // Open the first FAQ item
  const firstFaq = page.getByRole("button", { name: /Voor welke leeftijden/i });
  await firstFaq.click();
  await expect(page.getByText(/grofweg 4 tot 12 jaar/)).toBeVisible();

  // Hero CTA — assert href; navigating into a 404 isn't useful here
  const heroCta = page.getByRole("link", { name: /Start 14 dagen gratis/ }).first();
  await expect(heroCta).toHaveAttribute("href", "/signup");
});
