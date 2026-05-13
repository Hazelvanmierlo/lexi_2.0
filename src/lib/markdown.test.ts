import { describe, it, expect } from "vitest";
import { renderMarkdown } from "./markdown";

describe("renderMarkdown", () => {
  it("renders a paragraph", () => {
    const out = renderMarkdown("Hallo wereld.");
    expect(out).toEqual([{ kind: "p", text: "Hallo wereld." }]);
  });

  it("renders multiple paragraphs split by blank line", () => {
    const out = renderMarkdown("Een.\n\nTwee.");
    expect(out).toEqual([
      { kind: "p", text: "Een." },
      { kind: "p", text: "Twee." },
    ]);
  });

  it("renders a bullet list", () => {
    const out = renderMarkdown("- één\n- twee\n- drie");
    expect(out).toEqual([
      { kind: "ul", items: ["één", "twee", "drie"] },
    ]);
  });

  it("mixes paragraphs and lists", () => {
    const out = renderMarkdown("Para.\n\n- a\n- b\n\nAnder.");
    expect(out).toEqual([
      { kind: "p", text: "Para." },
      { kind: "ul", items: ["a", "b"] },
      { kind: "p", text: "Ander." },
    ]);
  });
});
