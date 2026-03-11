"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/login") return;

    // Check if auth cookie exists (httpOnly cookies aren't readable,
    // so ping the server to verify)
    fetch("/api/auth/check").then((res) => {
      if (!res.ok) {
        window.location.href = "/login";
      }
    });
  }, [pathname]);

  return <>{children}</>;
}
