import React from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { createCheckoutSession } from "@/lib/stripe-helpers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function PricingPage() {
  const stripeCheckoutSession = await createCheckoutSession();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    redirect("/login");
  }

  const stripePricingTableId = process.env.STRIPE_PRICING_TABLE_ID;
  const stripePublishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
  if (!stripePricingTableId || !stripePublishableKey) {
    throw new Error(
      "STRIPE_PRICING_TABLE_ID or STRIPE_PUBLISHABLE_KEY is not set"
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-[50vh] pt-10">
        {React.createElement("stripe-pricing-table", {
          "pricing-table-id": stripePricingTableId,
          "publishable-key": stripePublishableKey,
          "customer-session-client-secret": stripeCheckoutSession,
          "client-reference-id": data.user.id,
        })}
      </main>

      <Footer />
    </>
  );
}
