import { Stripe } from "stripe";
import { createSupabaseServerClient } from "./supabase/server";

const stripeSecret = process.env.STRIPE_SECRET;
if (!stripeSecret) {
  throw new Error(
    "Stripe secret key is not defined, please add STRIPE_SECRET in .env"
  );
}

const stripe = new Stripe(stripeSecret);

export async function createStripeCustomer(
  name: string,
  email: string,
  id: string
) {
  const customer = await stripe.customers.create({
    name: name ? name : "",
    email: email,
    metadata: {
      supabase_id: id,
    },
  });

  return customer.id;
}

export async function createCheckoutSession() {
  const supabase = await createSupabaseServerClient();

  // Get the user id from the database
  const { data } = await supabase.auth.getUser();
  const { data: userProfile } = await supabase
    .from("user_profiles")
    .select("stripe_customer_id")
    .eq("id", data.user?.id)
    .single();

  // Create a customer session
  const customerSession = await stripe.customerSessions.create({
    customer: userProfile?.stripe_customer_id,
    components: {
      pricing_table: {
        enabled: true,
      },
    },
  });
  return customerSession.client_secret;
}
