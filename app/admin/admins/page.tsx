import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Admins" };

export default async function AdminsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in?redirect=/admin/admins");

  const { data: admin } = await supabase
    .from("admins")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!admin || admin.role !== "superadmin") redirect("/admin");

  const { data: admins } = await supabase
    .from("admins")
    .select(
      "user_id, role, granted_at, notes, profile:profiles!admins_user_id_fkey(display_name)",
    )
    .order("granted_at", { ascending: true });

  type Row = {
    user_id: string;
    role: "superadmin" | "moderator";
    granted_at: string;
    notes: string | null;
    profile: { display_name: string | null } | { display_name: string | null }[] | null;
  };

  const list = ((admins ?? []) as Row[]).map((a) => ({
    ...a,
    profile: Array.isArray(a.profile) ? (a.profile[0] ?? null) : a.profile,
  }));

  return (
    <div>
      <h1 className="text-3xl font-black">Admins</h1>
      <p className="mt-2 text-text-secondary">
        Current admins. Granting + revoking is coming in the next pass — for
        now use the Supabase SQL editor and INSERT into <code>admins</code>.
      </p>

      <div className="mt-6 overflow-hidden rounded-3xl bg-white ring-1 ring-border/60">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-off-white">
            <tr>
              <th className="px-5 py-3 font-bold text-text-muted">Name</th>
              <th className="px-5 py-3 font-bold text-text-muted">Role</th>
              <th className="px-5 py-3 font-bold text-text-muted">Granted</th>
              <th className="px-5 py-3 font-bold text-text-muted">Notes</th>
            </tr>
          </thead>
          <tbody>
            {list.map((a) => (
              <tr key={a.user_id} className="border-b border-border last:border-b-0">
                <td className="px-5 py-3 font-bold text-charcoal">
                  {a.profile?.display_name ?? a.user_id.slice(0, 8) + "…"}
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${
                      a.role === "superadmin"
                        ? "bg-primary/10 text-primary"
                        : "bg-info/10 text-info"
                    }`}
                  >
                    {a.role}
                  </span>
                </td>
                <td className="px-5 py-3 text-text-secondary">
                  {new Date(a.granted_at).toLocaleDateString("en-ZA")}
                </td>
                <td className="px-5 py-3 text-text-muted">{a.notes ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
