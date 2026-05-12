import { Users } from "lucide-react";

export function WisselButton() {
  return (
    <form action="/api/kind/switch" method="POST">
      <button
        type="submit"
        className="inline-flex items-center gap-1 rounded-lexi border border-line bg-card px-3 py-1.5 text-xs font-medium text-ink-2 hover:bg-bg-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <Users className="h-3 w-3" />
        Wissel kind
      </button>
    </form>
  );
}
