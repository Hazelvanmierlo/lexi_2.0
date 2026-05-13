"use client";

import { CheckCircle2 } from "lucide-react";

/**
 * Top-right slide-in toast. The provider mounts a fresh instance keyed by
 * timestamp on every add — so each toast animates in fresh, then auto-dismisses
 * after 2s via the provider's setTimeout.
 */
export function CartToast({ message }: { message: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-20 right-5 z-[60] flex items-center gap-2 rounded-lexi border border-line bg-card px-4 py-3 text-sm font-medium text-ink shadow-lexi animate-[cart-toast-in_180ms_ease-out]"
    >
      <CheckCircle2 className="h-5 w-5 text-ok" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
