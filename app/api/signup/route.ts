import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * Signup API Route
 *
 * Creates a new user account in Supabase Auth and creates a profile in the user_profiles table.
 * The user is automatically logged in after successful signup.
 *
 * Expected user_profiles table structure:
 * - id: uuid (references auth.users.id)
 * - name: text
 * - email: text
 * - created_at: timestamp
 * - updated_at: timestamp
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = await createSupabaseServerClient();

    // Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    // Create user profile in user_profiles table
    const { error: profileError } = await supabase
      .from("user_profiles")
      .insert({
        id: authData.user.id,
        name,
        email,
        created_at: new Date().toISOString(),
      });

    if (profileError) {
      // If profile creation fails, we should ideally clean up the auth user
      // but for now, we'll just return the error
      console.error("Profile creation error:", profileError);
      return NextResponse.json(
        { error: "Failed to create user profile: " + profileError.message },
        { status: 500 }
      );
    }

    // User is automatically logged in after signUp
    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
        user: {
          id: authData.user.id,
          email: authData.user.email,
          name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
