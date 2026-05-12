import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtected = createRouteMatcher([
  "/kind(.*)",
  "/ouder(.*)",
  "/admin(.*)",
]);

const isAuthOnly = createRouteMatcher(["/login", "/signup"]);

export default clerkMiddleware(async (auth, req) => {
  if (process.env.NEXT_PUBLIC_AUTH_ENABLED !== "true") {
    // Auth is off — middleware is a no-op; demo behaviour applies.
    return;
  }

  const { userId } = await auth();

  if (isProtected(req) && !userId) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthOnly(req) && userId) {
    return NextResponse.redirect(new URL("/ouder", req.url));
  }
});

export const config = {
  matcher: [
    // Skip Next internals + all static files
    "/((?!_next|.*\\..*).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};
