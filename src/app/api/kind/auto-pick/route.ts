import { redirect } from "next/navigation";
import { currentHousehold } from "@/lib/auth";
import { setKidCookie } from "@/lib/kid-cookie";

// Route handler that *can* set cookies (unlike Server Components).
// /kind/page.tsx redirects here when a single-kid household has no cookie yet.
export async function GET(): Promise<Response> {
  const household = await currentHousehold();
  if (!household) redirect("/login?next=/kind");
  if (household.kids.length === 1) {
    await setKidCookie(household.kids[0].id);
    redirect("/kind");
  }
  redirect("/kind/picker");
}
