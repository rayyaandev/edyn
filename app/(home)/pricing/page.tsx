import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { createCheckoutSession } from "@/lib/stripe-helpers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "stripe-pricing-table": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

export default async function PricingPage() {
  const stripeCheckoutSession = await createCheckoutSession();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    redirect("/login");
  }

  return (
    <>
      <Navbar />
      <main className="min-h-[50vh] pt-10">
        <stripe-pricing-table
          pricing-table-id="prctbl_1SLo5RJz2vxEhtx97hKbnteF"
          publishable-key="pk_test_51SLVKQJz2vxEhtx9N3S6iigjztiYxi6pv5DunQU9EwAAobeJiq6ekT0LaM1f2LSAMIBqXwl1jGJi7yo3m2WYk0VM00y0uHrT5f"
          customer-session-client-secret={stripeCheckoutSession}
          client-reference-id={data.user.id}
        ></stripe-pricing-table>
      </main>

      <Footer />
    </>
  );
}
