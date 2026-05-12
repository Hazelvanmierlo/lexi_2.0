export function TypePreview() {
  return (
    <div aria-hidden="true" className="flex items-center rounded-lexi border border-line bg-card px-3 py-2">
      <span className="font-mono text-base text-ink">loo</span>
      <span className="ml-0.5 inline-block h-5 w-0.5 animate-pulse bg-primary" />
      <span className="ml-auto text-xs text-ink-3">→</span>
    </div>
  );
}
