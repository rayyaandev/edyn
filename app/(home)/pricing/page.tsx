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
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-muted-foreground text-lg">
            Select the perfect plan for your needs. Upgrade or downgrade at any
            time.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={plan.highlighted ? "border-primary shadow-lg" : ""}
            >
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.highlighted ? "default" : "outline"}
                >
                  {plan.highlighted ? "Get Started" : "Choose Plan"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
