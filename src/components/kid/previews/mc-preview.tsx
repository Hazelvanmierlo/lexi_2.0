const OPTIONS = ["12", "24", "30", "35"];

export function McPreview() {
  return (
    <ul aria-hidden="true" className="grid grid-cols-2 gap-2">
      {OPTIONS.map((o, i) => (
        <li
          key={o}
          className={`flex items-center justify-center rounded-lexi border px-3 py-2 text-sm font-medium ${
            i === 1
              ? "border-primary bg-primary-soft text-primary-ink"
              : "border-line bg-bg-2 text-ink-2"
          }`}
        >
          {o}
        </li>
      ))}
    </ul>
  );
}
