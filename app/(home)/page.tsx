import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Onboard } from "@/components/Onboard";
import { redirect } from "next/navigation";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

export default async function Home() {
  const supabase = await createSupabaseServerClient();

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user profile from user_profiles table
  const { data: userProfile, error } = await supabase
    .from("user_profiles")
    .select("name, has_onboarded")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Error fetching user profile:", error);
  }

  // Show Onboard component if user hasn't onboarded
  if (!userProfile?.has_onboarded) {
    return <Onboard />;
  }

  // Show welcome page if user has onboarded
  return (
    <>
      <Navbar />
      <main className="min-h-[50vh]">
        <h1 className="text-4xl font-bold text-center mt-20">
          Welcome {userProfile?.name || user.email}
        </h1>
      </main>
      <Footer />
    </>
  );
}
