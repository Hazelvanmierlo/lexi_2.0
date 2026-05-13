// Minimal markdown renderer for book descriptions.
//
// Supports paragraphs (separated by blank lines) and bullet lists (lines
// starting with "- "). Intentionally no headings, links, bold/italic, etc.
// If we need richer formatting later, swap in react-markdown.

export type Block =
  | { kind: "p"; text: string }
  | { kind: "ul"; items: string[] };

export function renderMarkdown(source: string): Block[] {
  const blocks: Block[] = [];
  const chunks = source.trim().split(/\n\s*\n+/);
  for (const chunk of chunks) {
    const lines = chunk.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length > 0 && lines.every((l) => l.startsWith("- "))) {
      blocks.push({ kind: "ul", items: lines.map((l) => l.slice(2).trim()) });
    } else {
      blocks.push({ kind: "p", text: lines.join(" ") });
    }
  }
  return blocks;
}
