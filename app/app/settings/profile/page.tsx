import { createClient } from "@/lib/supabase/server";
import { EditProfileForm } from "./EditProfileForm";

export const metadata = { title: "Edit profile" };

export default async function EditProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, city, favourite_sports, skill_level")
    .eq("id", user.id)
    .single();

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 sm:px-10">
      <h1 className="text-3xl font-black">Edit profile</h1>
      <p className="mt-2 text-text-secondary">
        Changes are visible on your public profile at /u/{user.id.slice(0, 8)}…
      </p>
      <div className="mt-8">
        <EditProfileForm
          initial={{
            displayName: profile?.display_name ?? "",
            city: profile?.city ?? null,
            favouriteSports: (profile?.favourite_sports ?? []) as string[],
            skillLevel: (profile?.skill_level ?? "any") as
              | "any"
              | "beginner"
              | "intermediate"
              | "advanced",
          }}
        />
      </div>
    </div>
  );
}
