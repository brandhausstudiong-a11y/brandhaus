import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { isAdminUserId } from "@/lib/admin-access";

/**
 * Protect server-rendered admin pages and layouts.
 * Unauthenticated users go to sign-in; signed-in non-admins go to /unauthorized.
 */
export async function requireAdminPage(): Promise<string> {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in?redirect_url=%2Fadmin");
  }

  if (!isAdminUserId(userId)) {
    redirect("/unauthorized");
  }

  return userId;
}

/**
 * Protect admin Route Handlers.
 * Return the Response immediately when the caller is not authorized.
 *
 * Usage:
 * const access = await requireAdminApi();
 * if (access instanceof Response) return access;
 */
export async function requireAdminApi(): Promise<
  { userId: string } | NextResponse
> {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Authentication required." },
      { status: 401 },
    );
  }

  if (!isAdminUserId(userId)) {
    return NextResponse.json(
      { success: false, message: "Administrator access required." },
      { status: 403 },
    );
  }

  return { userId };
}
