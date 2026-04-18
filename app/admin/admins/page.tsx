import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminsManager, type AdminListRow } from "./AdminsManager";

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
    profile:
      | { display_name: string | null }
      | { display_name: string | null }[]
      | null;
  };

  const list: AdminListRow[] = ((admins ?? []) as Row[]).map((a) => {
    const profile = Array.isArray(a.profile) ? (a.profile[0] ?? null) : a.profile;
    return {
      user_id: a.user_id,
      role: a.role,
      granted_at: a.granted_at,
      notes: a.notes,
      display_name: profile?.display_name ?? null,
    };
  });

  return (
    <div>
      <h1 className="text-3xl font-black">Admins</h1>
      <p className="mt-2 text-text-secondary">
        Superadmins can grant and revoke admin access. You can&apos;t revoke
        your own — ask another superadmin.
      </p>

      <div className="mt-6">
        <AdminsManager admins={list} currentUserId={user.id} />
      </div>
    </div>
  );
}
