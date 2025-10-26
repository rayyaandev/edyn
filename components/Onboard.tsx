"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { User } from "lucide-react";

export function Onboard() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    if (name.trim().length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/onboard-user", {
        method: "POST",
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error);
        return;
      }

      // Navigate to home page
      router.push("/pricing");
    } catch (error) {
      console.error("Onboarding error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Complete Your Profile</CardTitle>
          <CardDescription className="text-center">
            Tell us your name to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <div className="flex justify-center mb-6">
                  <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                    <User className="w-12 h-12 text-muted-foreground" />
                  </div>
                </div>
              </Field>
              <Field>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </Field>
              {error && <FieldError>{error}</FieldError>}
              <Field>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Continue"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
