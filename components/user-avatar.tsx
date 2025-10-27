"use client";

import { useUser } from "@/components/providers/user-provider";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface UserAvatarProps {
  className?: string;
}

export function UserAvatar({ className }: UserAvatarProps) {
  const user = useUser();

  // Get initials from user name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (user?.avatar) {
    return (
      <div
        className={cn(
          "relative w-9 h-9 rounded-full overflow-hidden border-2 border-background",
          className
        )}
      >
        <Image
          src={user.avatar}
          alt={user.name || "User avatar"}
          fill
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center w-9 h-9 rounded-full bg-primary text-primary-foreground font-semibold text-sm",
        className
      )}
    >
      {user?.name ? getInitials(user.name) : "U"}
    </div>
  );
}
