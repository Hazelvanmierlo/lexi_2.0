import { test, expect } from "@playwright/test";

test("admin quizzen — table renders with rows + new-quiz CTA", async ({ page }) => {
  await page.goto("/admin/quizzen");
  await expect(page.getByRole("heading", { name: /Quizzen & toetsen/ })).toBeVisible();
  await expect(page.getByText("Tafels van 5 en 6")).toBeVisible();
  await expect(page.getByText("Engelse dieren")).toBeVisible();
  await expect(page.getByText("Werkwoordspelling")).toBeVisible();
  await expect(page.getByRole("link", { name: /\+ Nieuwe quiz/ })).toBeVisible();
});
