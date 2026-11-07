import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isAdminUserId } from "./lib/admin-access";

export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl;
  const isAdminPage =
    pathname === "/admin" || pathname.startsWith("/admin/");
  const isAdminApi =
    pathname === "/api/admin" || pathname.startsWith("/api/admin/");
  // Store CRUD endpoints are used by the admin dashboard. Keep public GET
  // catalog requests available, but require an admin for writes.
  const isAdminStoreMutation =
    pathname.startsWith("/api/store/") &&
    ["POST", "PUT", "PATCH", "DELETE"].includes(request.method);

  if (!isAdminPage && !isAdminApi && !isAdminStoreMutation) return;

  const { userId } = await auth();

  if (!userId) {
    if (isAdminApi || isAdminStoreMutation) {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 },
      );
    }

    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set(
      "redirect_url",
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );
    return NextResponse.redirect(signInUrl);
  }

  if (!isAdminUserId(userId)) {
    if (isAdminApi || isAdminStoreMutation) {
      return NextResponse.json(
        { success: false, message: "Administrator access required." },
        { status: 403 },
      );
    }

    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
