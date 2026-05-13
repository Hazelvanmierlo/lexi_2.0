import { CheckCircle2 } from "lucide-react";

/**
 * Small "Op voorraad — morgen in huis" line used in WorkbookCard + book
 * detail. For v1 every workbook ships with this state; once real stock
 * tracking lands, conditional render against the SKU's stock count.
 */
export function StockLine({ short = false }: { short?: boolean }) {
  return (
    <p className="flex items-center gap-1 text-xs font-medium text-ok">
      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
      {short ? (
        <span>Op voorraad · morgen in huis</span>
      ) : (
        <span>Op voorraad — voor 22:00 besteld, morgen in huis</span>
      )}
    </p>
  );
}
