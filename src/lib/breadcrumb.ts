// Pure helper: maps a pathname (and optional params/search context) to an
// ordered list of breadcrumb segments. Dutch copy; all routes hard-coded.
//
// The last segment's href is `null` to signal "this is the current page —
// render as plain text, not a link" in the <Breadcrumb> component.

export type Crumb = { label: string; href: string | null };

export type BreadcrumbContext = {
  /** For /shop/boek/[slug] — the workbook title to show as the leaf segment. */
  bookTitle?: string;
  /** For /shop/boek/[slug] — the workbook subject (TAAL/REKENEN/LEZEN). */
  bookSubject?: string;
  /** For /shop/boek/[slug] — the workbook groep bucket ("1".."8"). */
  bookGroep?: string;
  /** For /shop with ?subject= — the (lowercase) subject filter. */
  subject?: string;
};

const SUBJECT_LABEL: Record<string, string> = {
  taal: "Taal",
  rekenen: "Rekenen",
  lezen: "Begrijpend Lezen",
  TAAL: "Taal",
  REKENEN: "Rekenen",
  LEZEN: "Begrijpend Lezen",
};

function subjectLabel(s: string | undefined): string | null {
  if (!s) return null;
  return SUBJECT_LABEL[s] ?? SUBJECT_LABEL[s.toLowerCase()] ?? null;
}

export function breadcrumbFor(pathname: string, ctx: BreadcrumbContext = {}): Crumb[] {
  // Normalise trailing slash so /shop/ and /shop both resolve.
  const path = pathname.replace(/\/$/, "") || "/";

  // Always start with Lexi.
  const root: Crumb = { label: "Lexi", href: "/" };

  // /shop
  if (path === "/shop") {
    const subj = subjectLabel(ctx.subject);
    if (subj) {
      return [
        root,
        { label: "Shop", href: "/shop" },
        { label: subj, href: null },
      ];
    }
    return [root, { label: "Shop", href: null }];
  }

  // /shop/boek/[slug]
  if (path.startsWith("/shop/boek/")) {
    const subj = subjectLabel(ctx.bookSubject) ?? "Werkboeken";
    const subjHref = ctx.bookSubject
      ? `/shop?subject=${ctx.bookSubject.toLowerCase()}`
      : "/shop";
    const crumbs: Crumb[] = [
      root,
      { label: "Shop", href: "/shop" },
      { label: subj, href: subjHref },
    ];
    if (ctx.bookGroep) {
      crumbs.push({ label: `Groep ${ctx.bookGroep}`, href: null });
    }
    crumbs.push({ label: ctx.bookTitle ?? "Werkboek", href: null });
    return crumbs;
  }

  if (path === "/shop/uitblinker") {
    return [
      root,
      { label: "Shop", href: "/shop" },
      { label: "Uitblinker", href: null },
    ];
  }

  if (path === "/winkelmand") {
    return [root, { label: "Winkelmand", href: null }];
  }

  if (path === "/afrekenen") {
    return [
      root,
      { label: "Winkelmand", href: "/winkelmand" },
      { label: "Afrekenen", href: null },
    ];
  }

  if (path === "/word-lid") {
    return [root, { label: "Word lid", href: null }];
  }

  if (path === "/hulp") {
    return [root, { label: "Klantenservice", href: null }];
  }

  // Fallback: just Lexi + the last segment titlecased.
  const segments = path.split("/").filter(Boolean);
  if (segments.length === 0) return [{ label: "Lexi", href: null }];
  const last = segments[segments.length - 1];
  return [root, { label: last.charAt(0).toUpperCase() + last.slice(1), href: null }];
}
