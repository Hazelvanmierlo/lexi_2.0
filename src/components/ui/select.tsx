import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Props = ComponentPropsWithoutRef<"select"> & {
  label: string;
  children: ReactNode;
};

export function Select({ label, id, className, children, ...rest }: Props) {
  const selectId = id ?? `select-${rest.name ?? Math.random().toString(36).slice(2)}`;
  return (
    <div className={className}>
      <label htmlFor={selectId} className="text-sm font-medium text-ink">
        {label}
      </label>
      <select
        id={selectId}
        {...rest}
        className="mt-1 w-full rounded-lexi border border-line bg-card px-3 py-2 text-ink focus:outline-2 focus:outline-offset-2 focus:outline-primary"
      >
        {children}
      </select>
    </div>
  );
}
