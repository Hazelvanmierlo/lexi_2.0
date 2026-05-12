const PAIRS = [
  { l: "dog", r: "hond", tone: "bg-primary-soft" },
  { l: "cat", r: "kat", tone: "bg-teal-soft" },
  { l: "bird", r: "vogel", tone: "bg-sun-soft" },
];

export function MatchPreview() {
  return (
    <ul aria-hidden="true" className="grid grid-cols-2 gap-1.5">
      {PAIRS.flatMap((p, i) => [
        <li key={`${i}-l`} className={`rounded-lexi ${p.tone} px-2 py-1 text-center text-xs font-medium text-ink`}>{p.l}</li>,
        <li key={`${i}-r`} className={`rounded-lexi ${p.tone} px-2 py-1 text-center text-xs font-medium text-ink`}>{p.r}</li>,
      ])}
    </ul>
  );
}
