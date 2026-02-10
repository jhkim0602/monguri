"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export type UserRole = "mentor" | "mentee" | "admin";

type RoleGuardProps = {
  allowedRoles: readonly UserRole[];
  children: React.ReactNode;
  redirectUnauthenticatedTo?: string;
};

export default function RoleGuard({
  allowedRoles,
  children,
  redirectUnauthenticatedTo = "/landing",
}: RoleGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const nextPath = pathname ?? "/";

    const checkRole = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!isMounted) return;

      if (userError || !user) {
        const next = `?next=${encodeURIComponent(nextPath)}`;
        router.replace(`${redirectUnauthenticatedTo}${next}`);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!isMounted) return;

      const role = profile?.role as UserRole | undefined;
      if (profileError || !role || !allowedRoles.includes(role)) {
        router.replace("/403");
        return;
      }

      setIsAllowed(true);
    };

    checkRole();

    return () => {
      isMounted = false;
    };
  }, [allowedRoles, redirectUnauthenticatedTo, router]);

  if (!isAllowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-sm text-slate-500">
        권한 확인 중...
      </div>
    );
  }

  return <>{children}</>;
}
