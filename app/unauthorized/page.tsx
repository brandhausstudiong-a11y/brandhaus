import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-5">
      <section className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
          OUTFITZ
        </p>
        <h1 className="mt-4 text-2xl font-semibold text-neutral-950">
          Admin access required
        </h1>
        <p className="mt-3 text-sm leading-6 text-neutral-600">
          You are signed in, but this account is not on the administrator
          allowlist. Contact the site owner if you believe this is a mistake.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <SignOutButton>
            <button className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50">
              Sign out
            </button>
          </SignOutButton>
          <Link
            href="/"
            className="rounded-md bg-neutral-950 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Return to store
          </Link>
        </div>
      </section>
    </main>
  );
}
