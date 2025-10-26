import Stripe from "stripe";
import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const stripeSecret = process.env.STRIPE_SECRET;
if (!stripeSecret) {
  throw new Error("STRIPE_SECRET is not set");
}
const stripe = new Stripe(stripeSecret);

export async function POST(req: Request) {
  const body = await req.text(); // must use raw text, not JSON
  const signature = (await headers()).get("stripe-signature");
  if (!signature) {
    return new Response("No signature", { status: 400 });
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    console.log("✅ Stripe event received:", event.type);
    if (event.type === "checkout.session.completed") {
      console.log("Full event data:", JSON.stringify(event, null, 2));
      const customerId = event.data.object.customer;
      const subscriptionId = event.data.object.subscription;

      // Get the user id from the database
      const supabase = await createSupabaseServerClient();
      const { data: userProfile } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .single();
      if (!userProfile) {
        console.error("User profile not found");
        return new Response("User profile not found", { status: 400 });
      }

      // Get plan name from subscription
      const subscription = await stripe.subscriptions.retrieve(
        subscriptionId as string
      );
      const productId = subscription.items.data[0].plan.product as string;
      const product = await stripe.products.retrieve(productId);
      const planName = product.name;

      // Update user profile with subscription id and stripe customer id
      const { error } = await supabase
        .from("user_profiles")
        .update({
          subscription_id: subscriptionId,
          plan_name: planName,
        })
        .eq("stripe_customer_id", customerId);

      if (error) {
        console.error("Error updating user profile:", error);
      }
    }

    return new Response("Webhook received", { status: 200 });
  } catch (err: any) {
    console.error("❌ Webhook Error:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
}
