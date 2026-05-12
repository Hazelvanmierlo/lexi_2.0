import { NextResponse } from "next/server";
import { clearKidCookie } from "@/lib/kid-cookie";

export async function POST(req: Request): Promise<NextResponse> {
  await clearKidCookie();
  return NextResponse.redirect(new URL("/kind/picker", req.url), 303);
}
