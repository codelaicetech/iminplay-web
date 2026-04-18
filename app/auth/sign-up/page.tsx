import Link from "next/link";
import { AuthForm } from "../AuthForm";
import { signUpAction } from "../actions";

export const metadata = {
  title: "Sign Up",
};

export default function SignUpPage() {
  return (
    <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-border/60 sm:p-10">
      <h1 className="text-3xl font-black">Join IminPlay</h1>
      <p className="mt-2 text-text-secondary">
        Find pickup sport in your city.
      </p>

      <div className="mt-6">
        <AuthForm
          action={signUpAction}
          submitLabel="Create account"
          pendingLabel="Creating account…"
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
              autoComplete: "new-password",
              placeholder: "At least 8 characters",
              hint: "Use 8+ characters. Mix letters, numbers, and symbols for a stronger password.",
            },
            {
              name: "confirm",
              label: "Confirm password",
              type: "password",
              autoComplete: "new-password",
              placeholder: "Repeat password",
            },
          ]}
          footer={
            <p className="text-sm text-text-secondary">
              Already have an account?{" "}
              <Link
                href="/auth/sign-in"
                className="font-bold text-primary hover:text-primary-dark"
              >
                Sign in
              </Link>
            </p>
          }
        />
      </div>

      <p className="mt-6 text-center text-xs text-text-muted">
        By creating an account you agree to our{" "}
        <Link href="/terms" className="underline hover:text-charcoal">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline hover:text-charcoal">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
