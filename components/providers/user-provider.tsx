"use client";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

interface IUser extends User {
  planName: string;
  name: string;
  userEmail: string;
  avatar?: string;
}

const UserContext = createContext<IUser | null>(null);
export const useUser = () => useContext(UserContext);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      try {
        const supabase = createSupabaseBrowserClient();

        // Get authenticated user
        const { data } = await supabase.auth.getUser();
        if (!data.user) {
          router.push("/login");
          return;
        }

        // Get user profile
        const { data: userProfile } = await supabase
          .from("user_profiles")
          .select()
          .eq("id", data.user?.id)
          .single();
        if (!userProfile) {
          router.push("/login");
          return;
        }
        if (!userProfile.subscription_id) {
          router.push("/pricing");
          return;
        }

        setUser({
          ...data.user,
          planName: userProfile.plan_name,
          name: userProfile.name || "User",
          userEmail: userProfile.email || data.user.email || "",
          avatar: userProfile.avatar,
        });
      } catch (error) {
        console.error("Error getting user:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}
