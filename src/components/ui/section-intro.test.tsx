import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SectionIntro } from "./section-intro";

describe("SectionIntro", () => {
  it("renders eyebrow, title, and lead", () => {
    render(<SectionIntro eyebrow="Voor ouders" title="Hoe het werkt" lead="Drie stappen." />);
    expect(screen.getByText("Voor ouders")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Hoe het werkt" })).toBeInTheDocument();
    expect(screen.getByText("Drie stappen.")).toBeInTheDocument();
  });

  it("center prop adds text-center class on the wrapper", () => {
    const { container } = render(
      <SectionIntro eyebrow="A" title="B" lead="C" center />,
    );
    expect(container.firstChild).toHaveClass("text-center");
  });

  it("omits lead when not provided", () => {
    render(<SectionIntro eyebrow="A" title="B" />);
    expect(screen.queryByText(/^B$/)).toBeInTheDocument();
  });
});
