import { test, expect } from "@playwright/test";

const FLAG_ON = process.env.NEXT_PUBLIC_AUTH_ENABLED === "true";

test.describe("auth E2E", () => {
  test.skip(!FLAG_ON, "AUTH_ENABLED is false — auth flow is not active");

  test("anonymous /kind redirects to /login with next param", async ({ page }) => {
    await page.goto("/kind", { waitUntil: "domcontentloaded" });
    expect(page.url()).toContain("/login");
    expect(page.url()).toContain("next=%2Fkind");
  });

  test("anonymous /admin/quizzen redirects to /login", async ({ page }) => {
    await page.goto("/admin/quizzen", { waitUntil: "domcontentloaded" });
    expect(page.url()).toContain("/login");
  });

  test("anonymous /ouder redirects to /login", async ({ page }) => {
    await page.goto("/ouder", { waitUntil: "domcontentloaded" });
    expect(page.url()).toContain("/login");
  });
});
