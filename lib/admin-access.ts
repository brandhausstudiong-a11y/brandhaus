/**
 * Server-only allowlist helper.
 *
 * Set ADMIN_CLERK_USER_IDS to a comma-separated list of Clerk user IDs.
 * Example: ADMIN_CLERK_USER_IDS=user_abc123,user_xyz789
 */
export function isAdminUserId(userId: string | null | undefined): boolean {
  if (!userId) return false;

  const allowedIds = (process.env.ADMIN_CLERK_USER_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  return allowedIds.includes(userId);
}
