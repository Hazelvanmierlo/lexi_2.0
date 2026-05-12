import { describe, expect, it, vi, beforeEach } from "vitest";

const { cookieSet, revalidatePath } = vi.hoisted(() => ({
  cookieSet: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({ set: cookieSet }),
}));
vi.mock("next/cache", () => ({
  revalidatePath,
}));

import { setLocale } from "./set-locale-action";

describe("setLocale", () => {
  beforeEach(() => {
    cookieSet.mockReset();
    revalidatePath.mockReset();
  });

  it("writes the cookie and revalidates for nl-NL", async () => {
    await setLocale("nl-NL");
    expect(cookieSet).toHaveBeenCalledWith(
      "lexi-locale",
      "nl-NL",
      expect.objectContaining({ path: "/" }),
    );
    expect(revalidatePath).toHaveBeenCalledWith("/");
  });

  it("writes the cookie and revalidates for nl-BE", async () => {
    await setLocale("nl-BE");
    expect(cookieSet).toHaveBeenCalledWith(
      "lexi-locale",
      "nl-BE",
      expect.objectContaining({ path: "/" }),
    );
    expect(revalidatePath).toHaveBeenCalledWith("/");
  });

  it("ignores invalid locales (no cookie write, no revalidate)", async () => {
    await setLocale("en");
    await setLocale("");
    await setLocale("nl-FR");
    expect(cookieSet).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
