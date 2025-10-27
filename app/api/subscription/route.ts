import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSubscription } from "@/lib/stripe-helpers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile with subscription_id
    const { data: userProfile } = await supabase
      .from("user_profiles")
      .select("subscription_id, plan_name")
      .eq("id", data.user.id)
      .single();

    if (!userProfile || !userProfile.subscription_id) {
      return NextResponse.json(
        { error: "No subscription found" },
        { status: 404 }
      );
    }

    // Get subscription details from Stripe
    const subscription = await getSubscription(userProfile.subscription_id);

    return NextResponse.json({
      planName: userProfile.plan_name,
      status: subscription.status,
      currentPeriodEnd: subscription.items.data[0].current_period_end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      trialEnd: subscription.trial_end,
      isTrialing: subscription.status === "trialing",
    });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}
