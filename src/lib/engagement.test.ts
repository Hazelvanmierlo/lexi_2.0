import { describe, it, expect } from "vitest";
import { ageBandFor } from "./engagement";

describe("ageBandFor", () => {
  it("returns 'klein' for groep 1-4", () => {
    expect(ageBandFor(1)).toBe("klein");
    expect(ageBandFor(2)).toBe("klein");
    expect(ageBandFor(3)).toBe("klein");
    expect(ageBandFor(4)).toBe("klein");
  });

  it("returns 'groot' for groep 5-8", () => {
    expect(ageBandFor(5)).toBe("groot");
    expect(ageBandFor(6)).toBe("groot");
    expect(ageBandFor(7)).toBe("groot");
    expect(ageBandFor(8)).toBe("groot");
  });
});
