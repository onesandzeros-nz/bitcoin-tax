"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <button
      onClick={handleLogout}
      className="hover:bg-gray-800 px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white"
    >
      Logout
    </button>
  );
}
