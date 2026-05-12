type Props = {
  eyebrow: string;
  title: string;
  lead?: string;
  center?: boolean;
};

export function SectionIntro({ eyebrow, title, lead, center = false }: Props) {
  return (
    <div className={`max-w-3xl ${center ? "mx-auto text-center" : ""}`}>
      <p className="text-sm font-medium uppercase tracking-wider text-primary-ink">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink text-balance md:text-5xl">
        {title}
      </h2>
      {lead && <p className="mt-4 text-lg text-ink-2 md:text-xl">{lead}</p>}
    </div>
  );
}
