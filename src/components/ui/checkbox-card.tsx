import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Props = ComponentPropsWithoutRef<"input"> & {
  label: string;
  description?: ReactNode;
};

export function CheckboxCard({ label, description, id, className, ...rest }: Props) {
  const cid = id ?? `cb-${rest.name ?? Math.random().toString(36).slice(2)}`;
  return (
    <label
      htmlFor={cid}
      className={`flex cursor-pointer items-start gap-3 rounded-lexi border border-line bg-card p-4 hover:bg-bg-2 has-[:checked]:border-primary has-[:checked]:bg-primary-soft ${className ?? ""}`}
    >
      <input type="checkbox" id={cid} {...rest} className="mt-0.5 h-4 w-4 accent-primary" />
      <span className="flex-1">
        <span className="block font-medium text-ink">{label}</span>
        {description && <span className="mt-1 block text-sm text-ink-2">{description}</span>}
      </span>
    </label>
  );
}
