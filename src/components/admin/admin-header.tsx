import Link from "next/link";
import { Menu } from "lucide-react";
import { MascotImage } from "@/components/ui/mascot";

export function AdminHeader() {
  return (
    <header className="border-b border-line-2 bg-card">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-3">
        <Link href="/" className="flex items-center gap-2">
          <MascotImage style="bot" age="kid" size={28} decorative className="h-7 w-7" />
          <span className="font-display text-lg font-bold tracking-tight text-ink">Lexi.kids</span>
        </Link>
        <button
          type="button"
          aria-label="Menu"
          className="rounded-lexi border border-line bg-card p-2 text-ink hover:bg-bg-2"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
