import Link from "next/link";
import { AuthForm } from "../AuthForm";
import { signInAction } from "../actions";

type PageProps = {
  searchParams: Promise<{ redirect?: string }>;
};

export const metadata = {
  title: "Sign In",
};

export default async function SignInPage({ searchParams }: PageProps) {
  const { redirect = "/app" } = await searchParams;

  return (
    <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-border/60 sm:p-10">
      <h1 className="text-3xl font-black">Sign in</h1>
      <p className="mt-2 text-text-secondary">
        Welcome back. Find your game.
      </p>

      <div className="mt-6">
        <AuthForm
          action={signInAction}
          submitLabel="Sign In"
          pendingLabel="Signing you in…"
          hidden={{ redirect }}
          fields={[
            {
              name: "email",
              label: "Email",
              type: "email",
              autoComplete: "email",
              placeholder: "you@example.com",
            },
            {
              name: "password",
              label: "Password",
              type: "password",
              autoComplete: "current-password",
              placeholder: "••••••••",
            },
          ]}
          footer={
            <div className="flex items-center justify-between text-sm">
              <Link
                href="/auth/reset-password"
                className="font-bold text-primary hover:text-primary-dark"
              >
                Forgot password?
              </Link>
              <Link
                href="/auth/sign-up"
                className="font-bold text-charcoal hover:text-primary"
              >
                Create account →
              </Link>
            </div>
          }
        />
      </div>
    </div>
  );
}
