import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { createStripeCustomer } from "@/lib/stripe-helpers";

export async function POST(request: NextRequest) {
  const { name } = await request.json();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user || !data.user.email || !data.user.id) {
    return NextResponse.json({ error: "User not found" }, { status: 400 });
  }

  // Create stripe customer
  const stripeId = await createStripeCustomer(
    name.trim(),
    data.user.email,
    data.user.id
  );

  // Update the user profile with name and has_onboarded
  const { error: updateError } = await supabase
    .from("user_profiles")
    .update({
      name: name.trim(),
      has_onboarded: true,
      stripe_customer_id: stripeId,
    })
    .eq("id", data.user?.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json(
    { message: "User onboarded successfully" },
    { status: 200 }
  );
}
