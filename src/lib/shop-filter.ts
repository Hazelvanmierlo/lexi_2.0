// Pure filter logic for the shop index — subject × groep.
//
// Subject comparison is case-insensitive because URL query params arrive
// lowercase ("taal"), while the DB enum is uppercase ("TAAL").

type Filters = { subject: string; groep: string };

export function applyShopFilters<T extends { subject: string; groepBucket: string }>(
  workbooks: T[],
  filters: Filters,
): T[] {
  return workbooks.filter((w) => {
    if (filters.subject !== "all") {
      if (w.subject.toLowerCase() !== filters.subject.toLowerCase()) return false;
    }
    if (filters.groep !== "all") {
      if (w.groepBucket !== filters.groep) return false;
    }
    return true;
  });
}
