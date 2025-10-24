import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <nav className="border-b bg-background">
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
              href="/onboarding"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Onboarding
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Pricing
            </Link>
          </div>
        </div>

        {/* Logout button on the right */}
        <div className="flex items-center">
          <Button variant="outline" size="sm">
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}
