import { Check } from "lucide-react";

export function BookHighlights({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-ink">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-ok" aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
