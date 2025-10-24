"use client";

import { useState } from "react";
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
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Check, X } from "lucide-react";

type FormErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
};

type PasswordRules = {
  minLength: boolean;
  hasLowercase: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
};

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const router = useRouter();
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [password, setPassword] = useState("");
  const [passwordRules, setPasswordRules] = useState<PasswordRules>({
    minLength: false,
    hasLowercase: false,
    hasUppercase: false,
    hasNumber: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const checkPasswordRules = (value: string): PasswordRules => {
    return {
      minLength: value.length >= 8,
      hasLowercase: /(?=.*[a-z])/.test(value),
      hasUppercase: /(?=.*[A-Z])/.test(value),
      hasNumber: /(?=.*\d)/.test(value),
    };
  };

  const validateField = (
    name: string,
    value: string,
    allValues?: Record<string, string>
  ) => {
    switch (name) {
      case "name":
        if (!value.trim()) {
          return "Full name is required";
        }
        if (value.trim().length < 2) {
          return "Name must be at least 2 characters";
        }
        return "";

      case "email":
        if (!value.trim()) {
          return "Email is required";
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return "Please enter a valid email address";
        }
        return "";

      case "password":
        if (!value) {
          return "Password is required";
        }
        const rules = checkPasswordRules(value);
        if (
          !rules.minLength ||
          !rules.hasLowercase ||
          !rules.hasUppercase ||
          !rules.hasNumber
        ) {
          return "Password does not meet all requirements";
        }
        return "";

      case "confirmPassword":
        if (!value) {
          return "Please confirm your password";
        }
        if (allValues && value !== allValues.password) {
          return "Passwords do not match";
        }
        return "";

      default:
        return "";
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    const form = e.target.form;
    const allValues = form
      ? {
          name:
            (form.elements.namedItem("name") as HTMLInputElement)?.value || "",
          email:
            (form.elements.namedItem("email") as HTMLInputElement)?.value || "",
          password:
            (form.elements.namedItem("password") as HTMLInputElement)?.value ||
            "",
          confirmPassword:
            (form.elements.namedItem("confirmPassword") as HTMLInputElement)
              ?.value || "",
        }
      : undefined;

    const error = validateField(name, value, allValues);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Update password state and rules
    if (name === "password") {
      setPassword(value);
      setPasswordRules(checkPasswordRules(value));
    }

    if (touched[name]) {
      const form = e.target.form;
      const allValues = form
        ? {
            name:
              (form.elements.namedItem("name") as HTMLInputElement)?.value ||
              "",
            email:
              (form.elements.namedItem("email") as HTMLInputElement)?.value ||
              "",
            password:
              (form.elements.namedItem("password") as HTMLInputElement)
                ?.value || "",
            confirmPassword:
              (form.elements.namedItem("confirmPassword") as HTMLInputElement)
                ?.value || "",
          }
        : undefined;

      const error = validateField(name, value, allValues);
      setErrors((prev) => ({ ...prev, [name]: error }));

      // Also revalidate confirm password if password changes
      if (name === "password" && touched.confirmPassword && form) {
        const confirmPasswordError = validateField(
          "confirmPassword",
          (form.elements.namedItem("confirmPassword") as HTMLInputElement)
            ?.value || "",
          { ...allValues, password: value }
        );
        setErrors((prev) => ({
          ...prev,
          confirmPassword: confirmPasswordError,
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = {
      name: (form.elements.namedItem("name") as HTMLInputElement)?.value || "",
      email:
        (form.elements.namedItem("email") as HTMLInputElement)?.value || "",
      password:
        (form.elements.namedItem("password") as HTMLInputElement)?.value || "",
      confirmPassword:
        (form.elements.namedItem("confirmPassword") as HTMLInputElement)
          ?.value || "",
    };

    // Validate all fields
    const newErrors: FormErrors = {
      name: validateField("name", formData.name),
      email: validateField("email", formData.email),
      password: validateField("password", formData.password),
      confirmPassword: validateField(
        "confirmPassword",
        formData.confirmPassword,
        formData
      ),
    };

    setErrors(newErrors);
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    // Check if there are any errors
    const hasErrors = Object.values(newErrors).some((error) => error !== "");
    if (hasErrors) {
      return;
    }

    // Form is valid, submit to Supabase
    setIsLoading(true);
    setErrors({}); // Clear any previous errors

    try {
      const supabase = createSupabaseBrowserClient();

      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
          },
        },
      });

      if (authError) {
        setErrors({ general: authError.message });
        return;
      }

      if (!authData.user) {
        setErrors({ general: "Failed to create account" });
        return;
      }

      // Create user profile in user_profiles table
      const { error: profileError } = await supabase
        .from("user_profiles")
        .insert({
          id: authData.user.id,
          name: formData.name,
          email: formData.email,
          created_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error("Profile creation error:", profileError);
        setErrors({
          general:
            "Account created but profile setup failed. Please contact support.",
        });
        return;
      }

      // Success! Redirect to home (user is automatically logged in)
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Signup error:", error);
      setErrors({ general: "An unexpected error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                onBlur={handleBlur}
                onChange={handleChange}
                aria-invalid={touched.name && !!errors.name}
                disabled={isLoading}
              />
              {touched.name && errors.name && (
                <FieldError>{errors.name}</FieldError>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                onBlur={handleBlur}
                onChange={handleChange}
                aria-invalid={touched.email && !!errors.email}
                disabled={isLoading}
              />
              {touched.email && errors.email && (
                <FieldError>{errors.email}</FieldError>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                onBlur={handleBlur}
                onChange={handleChange}
                aria-invalid={touched.password && !!errors.password}
                disabled={isLoading}
              />
              <div className="space-y-2 mt-2">
                <div className="flex items-center gap-2 text-sm">
                  {passwordRules.minLength ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <X className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span
                    className={
                      passwordRules.minLength
                        ? "text-green-600"
                        : "text-muted-foreground"
                    }
                  >
                    At least 8 characters
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {passwordRules.hasLowercase ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <X className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span
                    className={
                      passwordRules.hasLowercase
                        ? "text-green-600"
                        : "text-muted-foreground"
                    }
                  >
                    One lowercase letter
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {passwordRules.hasUppercase ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <X className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span
                    className={
                      passwordRules.hasUppercase
                        ? "text-green-600"
                        : "text-muted-foreground"
                    }
                  >
                    One uppercase letter
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {passwordRules.hasNumber ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <X className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span
                    className={
                      passwordRules.hasNumber
                        ? "text-green-600"
                        : "text-muted-foreground"
                    }
                  >
                    One number
                  </span>
                </div>
              </div>
            </Field>
            <Field>
              <FieldLabel htmlFor="confirmPassword">
                Confirm Password
              </FieldLabel>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                onBlur={handleBlur}
                onChange={handleChange}
                aria-invalid={
                  touched.confirmPassword && !!errors.confirmPassword
                }
                disabled={isLoading}
              />
              {!errors.confirmPassword && (
                <FieldDescription>
                  Please confirm your password.
                </FieldDescription>
              )}
              {touched.confirmPassword && errors.confirmPassword && (
                <FieldError>{errors.confirmPassword}</FieldError>
              )}
            </Field>
            {errors.general && (
              <FieldError className="text-center">{errors.general}</FieldError>
            )}
            <FieldGroup>
              <Field>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
                <FieldDescription className="px-6 text-center">
                  Already have an account? <Link href="/login">Sign in</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
