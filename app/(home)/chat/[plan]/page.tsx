import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { getSubscription } from "@/lib/stripe-helpers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ plan: string }>;
}) {
  const { plan } = await params;
  const supabase = await createSupabaseServerClient();
  const user = await supabase.auth.getUser();
  if (!user.data.user) {
    redirect("/login");
  }

  // Get user profile
  const { data: userProfile } = await supabase
    .from("user_profiles")
    .select()
    .eq("id", user.data.user.id)
    .single();
  if (!userProfile) {
    redirect("/login");
  }

  // Redirect to the correct plan if the user is not on the correct plan
  const userPlanName = userProfile.plan_name.toLowerCase().replace(" ", "-");
  if (userPlanName !== plan) {
    redirect(`/chat/${userPlanName}`);
  }

  const subscription = await getSubscription(userProfile.subscription_id);
  console.log(subscription.status, subscription.trial_end);

  return (
    <>
      <Navbar />
      <main className="min-h-[50vh]">
        {subscription.status !== "active" &&
        subscription.status !== "trialing" ? (
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold text-center mt-20">
              Your subscription is not active. Please renew your subscription to
              continue using the chat.
            </h1>
          </div>
        ) : subscription.status === "trialing" &&
          subscription.trial_end &&
          subscription.trial_end * 1000 <= Date.now() ? (
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold text-center mt-20">
              Your trial has ended. Please renew your subscription to continue
              using the chat.
            </h1>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold text-center mt-20">
              Welcome to the {userProfile.plan_name} chat
            </h1>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
