import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const plans = [
  {
    name: "Plan A",
    price: "$9",
    period: "per month",
    description: "Perfect for individuals getting started",
    features: [
      "Up to 10 projects",
      "Basic analytics",
      "24/7 support",
      "1GB storage",
      "Email notifications",
    ],
    highlighted: false,
  },
  {
    name: "Plan B",
    price: "$29",
    period: "per month",
    description: "Ideal for growing teams and businesses",
    features: [
      "Unlimited projects",
      "Advanced analytics",
      "Priority support",
      "50GB storage",
      "Email & SMS notifications",
      "Custom integrations",
      "Team collaboration",
    ],
    highlighted: true,
  },
  {
    name: "Plan C",
    price: "$99",
    period: "per month",
    description: "Enterprise-grade solution for large organizations",
    features: [
      "Unlimited everything",
      "Advanced analytics & reporting",
      "Dedicated account manager",
      "500GB storage",
      "All notification types",
      "Custom integrations",
      "Advanced team collaboration",
      "SSO & advanced security",
      "API access",
    ],
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-[50vh] pt-10">
        <stripe-pricing-table
          pricing-table-id="prctbl_1SLo5RJz2vxEhtx97hKbnteF"
          publishable-key="pk_test_51SLVKQJz2vxEhtx9N3S6iigjztiYxi6pv5DunQU9EwAAobeJiq6ekT0LaM1f2LSAMIBqXwl1jGJi7yo3m2WYk0VM00y0uHrT5f"
        ></stripe-pricing-table>
      </main>

      <Footer />
    </>
  );
}
