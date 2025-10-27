"use client";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { useUser } from "@/components/providers/user-provider";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  Loader2,
  User,
  Mail,
  CreditCard,
  Calendar,
  AlertCircle,
} from "lucide-react";

interface SubscriptionData {
  planName: string;
  status: string;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
  trialEnd: number | null;
  isTrialing: boolean;
}

export default function ProfilePage() {
  const user = useUser();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    redirect("/login");
  }

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/subscription");
      if (!response.ok) {
        throw new Error("Failed to fetch subscription");
      }
      const data = await response.json();
      setSubscription(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load subscription"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    window.location.href =
      "https://billing.stripe.com/p/login/test_6oU8wQ7Ga9mb69Abwo1gs00";
  };

  const handleCancelSubscription = async () => {
    if (
      !confirm(
        "Are you sure you want to cancel your subscription? You'll still have access until the end of your billing period."
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch("/api/subscription/cancel", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to cancel subscription");
      }
      await fetchSubscription();
      alert(
        "Your subscription has been scheduled for cancellation at the end of the billing period."
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to cancel subscription"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      active:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      trialing: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      canceled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      past_due:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    };

    return (
      <span
        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
          statusColors[status] || statusColors.active
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <>
      <Navbar />
      <main className="min-h-[70vh] container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-12">My Profile</h1>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* User Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                User Information
              </CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{user.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user.userEmail}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Subscription
              </CardTitle>
              <CardDescription>Manage your subscription plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : error ? (
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="w-5 h-5" />
                  <p>{error}</p>
                </div>
              ) : subscription ? (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Current Plan
                        </p>
                        <p className="font-semibold text-lg">
                          {subscription.planName}
                        </p>
                      </div>
                      {getStatusBadge(subscription.status)}
                    </div>

                    {subscription.isTrialing && subscription.trialEnd && (
                      <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <div>
                          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                            Trial Period
                          </p>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            Your trial ends on{" "}
                            {formatDate(subscription.trialEnd)}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {subscription.cancelAtPeriodEnd
                            ? "Access until"
                            : "Next billing date"}
                        </p>
                        <p className="font-medium">
                          {formatDate(subscription.currentPeriodEnd)}
                        </p>
                      </div>
                    </div>

                    {subscription.cancelAtPeriodEnd && (
                      <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        <p className="text-sm text-yellow-900 dark:text-yellow-100">
                          Your subscription is scheduled to cancel at the end of
                          the billing period.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleManageSubscription}
                      className="flex-1 cursor-pointer"
                    >
                      Manage Subscription
                    </Button>
                    {!subscription.cancelAtPeriodEnd && (
                      <Button
                        variant="outline"
                        onClick={handleCancelSubscription}
                        disabled={actionLoading}
                        className="flex-1 cursor-pointer"
                      >
                        {actionLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          "Cancel Subscription"
                        )}
                      </Button>
                    )}
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}
