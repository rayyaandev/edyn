import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripeSecret = process.env.STRIPE_SECRET;
if (!stripeSecret) {
  throw new Error("STRIPE_SECRET is not set");
}
const stripe = new Stripe(stripeSecret);

export async function POST() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile with subscription_id
    const { data: userProfile } = await supabase
      .from("user_profiles")
      .select("subscription_id")
      .eq("id", data.user.id)
      .single();

    if (!userProfile || !userProfile.subscription_id) {
      return NextResponse.json(
        { error: "No subscription found" },
        { status: 404 }
      );
    }

    // Cancel subscription at period end
    const subscription = await stripe.subscriptions.update(
      userProfile.subscription_id,
      {
        cancel_at_period_end: true,
      }
    );

    return NextResponse.json({
      success: true,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodEnd: subscription.items.data[0].current_period_end,
    });
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}
