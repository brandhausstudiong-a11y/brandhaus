import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
            OUTFITZ
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-neutral-950">
            Admin sign in
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            Sign in with your authorized administrator account.
          </p>
        </div>

        <SignIn
          path="/sign-in"
          routing="path"
          fallbackRedirectUrl="/admin"
          signUpUrl={undefined}
        />
      </div>
    </main>
  );
}
