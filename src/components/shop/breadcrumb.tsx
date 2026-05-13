import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Crumb } from "@/lib/breadcrumb";

/**
 * Renders an ordered list of breadcrumbs joined with chevrons. The last crumb
 * (href === null) is rendered as plain text and marked aria-current="page".
 */
export function Breadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  if (!crumbs.length) return null;
  return (
    <nav aria-label="Broodkruimels" data-test="breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-xs text-ink-2">
        {crumbs.map((c, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <li key={`${i}-${c.label}`} className="inline-flex items-center gap-1">
              {c.href && !isLast ? (
                <Link
                  href={c.href}
                  className="rounded font-medium hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  {c.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={isLast ? "font-medium text-ink" : "font-medium"}
                >
                  {c.label}
                </span>
              )}
              {!isLast ? (
                <ChevronRight className="h-3 w-3 text-line-2" aria-hidden="true" />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
