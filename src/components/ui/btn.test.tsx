import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Btn } from "./btn";

describe("Btn", () => {
  it("renders an <a> when href is provided", () => {
    render(<Btn href="/signup">Start</Btn>);
    const el = screen.getByRole("link", { name: "Start" });
    expect(el.tagName).toBe("A");
    expect(el).toHaveAttribute("href", "/signup");
  });

  it("renders a <button> when no href", () => {
    render(<Btn>Click</Btn>);
    expect(screen.getByRole("button", { name: "Click" }).tagName).toBe("BUTTON");
  });

  it("primary variant applies primary classes", () => {
    render(<Btn variant="primary">P</Btn>);
    expect(screen.getByText("P").className).toMatch(/bg-primary/);
  });

  it("ghost variant applies ghost classes", () => {
    render(<Btn variant="ghost">G</Btn>);
    expect(screen.getByText("G").className).toMatch(/border-line/);
  });
});
