import type { ComponentPropsWithoutRef } from "react";

type Props = ComponentPropsWithoutRef<"input"> & { label: string };

export function Input({ label, id, className, ...rest }: Props) {
  const inputId = id ?? `input-${rest.name ?? Math.random().toString(36).slice(2)}`;
  return (
    <div className={className}>
      <label htmlFor={inputId} className="text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={inputId}
        {...rest}
        className="mt-1 w-full rounded-lexi border border-line bg-card px-3 py-2 text-ink placeholder:text-ink-2 focus:outline-2 focus:outline-offset-2 focus:outline-primary"
      />
    </div>
  );
}
