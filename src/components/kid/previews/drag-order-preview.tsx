import { GripVertical } from "lucide-react";

const ITEMS = ["1/2", "1/4", "3/4", "1/3"];

export function DragOrderPreview() {
  return (
    <ul aria-hidden="true" className="space-y-1.5">
      {ITEMS.map((it) => (
        <li key={it} className="flex items-center gap-2 rounded-lexi border border-line bg-card px-2 py-1.5">
          <GripVertical className="h-3 w-3 text-ink-3" />
          <span className="font-mono text-sm text-ink">{it}</span>
        </li>
      ))}
    </ul>
  );
}
