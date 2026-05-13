import { test, expect } from "@playwright/test";

// Theme A acceptance tests — gated behind a logged-in Clerk session, the
// same constraint as auth.spec.ts. Skipped in CI when AUTH_ENABLED is off.
const FLAG_ON = process.env.NEXT_PUBLIC_AUTH_ENABLED === "true";
const HAS_TEST_SESSION = !!process.env.E2E_TEST_SESSION_COOKIE;

test.describe("Games Theme A", () => {
  test.skip(
    !FLAG_ON || !HAS_TEST_SESSION,
    "AUTH_ENABLED off or no test-session cookie available",
  );

  // These are sketches — they require a live seeded test fixture
  // (E2E_QUIZ_ID_MC, E2E_QUIZ_ID_TYPE) plus a logged-in kid session
  // (E2E_TEST_SESSION_COOKIE). Mark them todo until those env vars land.
  test.fixme(
    "MC wrong answer reveals the correct option in green",
    async ({ page }) => {
      const quizId = process.env.E2E_QUIZ_ID_MC;
      if (!quizId) test.skip();
      await page.goto(`/kind/spelen/${quizId}`);
      await page.getByRole("button", { name: /Start/ }).click();
      // Pick the first option (likely wrong).
      const options = page.locator('[role="radio"]');
      await options.nth(0).click();
      // Wait for feedback bar to appear with a Volgende button.
      await expect(page.getByRole("button", { name: /Volgende/ })).toBeVisible();
      // The correct option's button has border-ok class applied.
      await expect(page.locator(".border-ok").first()).toBeVisible();
    },
  );

  test.fixme(
    "Type accepts typo-1 answer as correct",
    async ({ page }) => {
      const quizId = process.env.E2E_QUIZ_ID_TYPE;
      if (!quizId) test.skip();
      await page.goto(`/kind/spelen/${quizId}`);
      await page.getByRole("button", { name: /Start/ }).click();
      // Seed quiz expected answer e.g. "hond" — kid types "hund".
      await page.getByLabel("Antwoord").fill("hund");
      await page.getByRole("button", { name: /Check/ }).click();
      await expect(page.getByText(/Goed/)).toBeVisible();
    },
  );
});
