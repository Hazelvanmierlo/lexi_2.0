import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Props = ComponentPropsWithoutRef<"input"> & {
  label: string;
  description?: ReactNode;
  badge?: string;
};

export function RadioCard({ label, description, badge, id, className, ...rest }: Props) {
  const rid = id ?? `r-${rest.name}-${rest.value}`;
  return (
    <label
      htmlFor={rid}
      className={`flex cursor-pointer items-start gap-3 rounded-lexi-lg border p-5 has-[:checked]:border-primary has-[:checked]:bg-primary-soft ${className ?? "border-line bg-card"}`}
    >
      <input type="radio" id={rid} {...rest} className="mt-1 h-4 w-4 accent-primary" />
      <span className="flex-1">
        <span className="flex items-center gap-2">
          <span className="font-display text-lg font-bold text-ink">{label}</span>
          {badge && (
            <span className="inline-flex items-center rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-white">
              {badge}
            </span>
          )}
        </span>
        {description && <span className="mt-1 block text-sm text-ink-2">{description}</span>}
      </span>
    </label>
  );
}
