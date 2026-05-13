const TARGETS = ["12", "24", "30", "35"];
const CHOSEN = 2;

export function CatapultPreview() {
  return (
    <div aria-hidden="true" className="space-y-1.5">
      <ul className="grid grid-cols-4 gap-1.5">
        {TARGETS.map((t, i) => (
          <li
            key={t}
            className={`flex items-center justify-center rounded-lexi border py-1 text-xs font-semibold ${
              i === CHOSEN
                ? "border-primary bg-primary-soft text-primary-ink"
                : "border-line bg-bg-2 text-ink-2"
            }`}
          >
            {t}
          </li>
        ))}
      </ul>
      <svg
        viewBox="0 0 100 24"
        preserveAspectRatio="none"
        className="h-5 w-full"
      >
        <path
          d="M 8 22 Q 45 -5 65 4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeDasharray="2.5 2.5"
          strokeLinecap="round"
          className="text-primary"
        />
        <circle cx="8" cy="22" r="2.5" className="fill-ink-2" />
        <circle cx="65" cy="4" r="2" className="fill-primary" />
      </svg>
    </div>
  );
}
