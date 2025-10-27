"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useUser } from "@/components/providers/user-provider";

export function Navbar() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const user = useUser();

  const signOut = async () => {
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
    } else {
      router.push("/login");
    }
    setLoading(false);
  };

  return (
    <nav className="border-b bg-background" id="navbar">
      <div className="flex h-16 items-center px-6 max-w-7xl mx-auto">
        {/* Logo on the left */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-primary">Edyn</span>
        </Link>

        {/* Nav links in the center */}
        <div className="flex-1 flex justify-center">
          <div className="flex items-center space-x-8">
            <Link
              href="/"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Home
            </Link>
            <Link
              href={`/chat/${user?.planName.toLowerCase().replace(" ", "-")}`}
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Chat
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Pricing
            </Link>
            <Link
              href="/profile"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Profile
            </Link>
          </div>
        </div>

        {/* Logout button on the right */}
        <div className="flex items-center">
          <Button
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={async () => {
              await signOut();
            }}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Logout"}
          </Button>
        </div>
      </div>
    </nav>
  );
}
