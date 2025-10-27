"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useState } from "react";
import { Loader2, User, CreditCard, LogOut } from "lucide-react";
import { useUser } from "@/components/providers/user-provider";
import { UserAvatar } from "@/components/user-avatar";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

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
          </div>
        </div>

        {/* User avatar dropdown on the right */}
        <div className="flex items-center">
          <DropdownMenu
            trigger={
              <div className="hover:opacity-80 transition-opacity">
                <UserAvatar />
              </div>
            }
          >
            <DropdownMenuLabel>
              {user?.name || "User"}
              <div className="text-xs font-normal text-muted-foreground mt-0.5">
                {user?.userEmail}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/profile")}>
              <User className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/pricing")}>
              <CreditCard className="w-4 h-4 mr-2" />
              Upgrade
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async () => {
                await signOut();
              }}
              className="text-destructive focus:text-destructive"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Logging out...
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
