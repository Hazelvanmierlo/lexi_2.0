import { test, expect } from "@playwright/test";

test("kid home — header, greeting, quizzes visible", async ({ page }) => {
  await page.goto("/kind");

  // Coin counter
  await expect(page.getByText(/120/).first()).toBeVisible();

  // Greeting heading
  await expect(page.getByRole("heading", { name: /Klaar voor de quiz van vandaag\?/ })).toBeVisible();

  // Mijn vakken section
  await expect(page.getByText(/Mijn vakken/i)).toBeVisible();

  // At least 4 quiz titles
  await expect(page.getByText("Tafels van 5 en 6")).toBeVisible();
  await expect(page.getByText(/Spelling — d of t/)).toBeVisible();
  await expect(page.getByText("Engelse dieren")).toBeVisible();
  await expect(page.getByText("Breuken op volgorde")).toBeVisible();

  // First Start link routes to /kind/spelen/tafels-5-6
  const firstStart = page.getByRole("link", { name: /^Start$/ }).first();
  await expect(firstStart).toHaveAttribute("href", "/kind/spelen/tafels-5-6");
});
