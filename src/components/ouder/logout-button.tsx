"use client";

import { useClerk } from "@clerk/nextjs";

export function LogoutButton() {
  const { signOut } = useClerk();
  return (
    <button
      type="button"
      onClick={() => signOut({ redirectUrl: "/" })}
      className="text-sm font-medium text-ink-2 underline hover:text-ink"
    >
      Uitloggen
    </button>
  );
}
