import Link from "next/link";
import { AuthForm } from "../AuthForm";
import { resetPasswordAction } from "../actions";

export const metadata = {
  title: "Reset password",
};

export default function ResetPasswordPage() {
  return (
    <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-border/60 sm:p-10">
      <h1 className="text-3xl font-black">Reset password</h1>
      <p className="mt-2 text-text-secondary">
        We&apos;ll send you a link to choose a new one.
      </p>

      <div className="mt-6">
        <AuthForm
          action={resetPasswordAction}
          submitLabel="Send reset link"
          pendingLabel="Sending…"
          fields={[
            {
              name: "email",
              label: "Email",
              type: "email",
              autoComplete: "email",
              placeholder: "you@example.com",
            },
          ]}
          footer={
            <Link
              href="/auth/sign-in"
              className="inline-block text-sm font-bold text-primary hover:text-primary-dark"
            >
              ← Back to sign in
            </Link>
          }
        />
      </div>
    </div>
  );
}
