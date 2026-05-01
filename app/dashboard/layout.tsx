"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { usePathname, useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        router.push("/login");
        return;
      }

      setCheckingAuth(false);
    }

    checkUser();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  function navClass(href: string) {
    const active = pathname === href || pathname.startsWith(`${href}/`);
    return active
      ? "rounded-md bg-black/5 px-3 py-2 text-sm font-medium"
      : "rounded-md px-3 py-2 text-sm font-medium transition hover:bg-black/5";
  }

  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-[#f3f3f3] px-6 py-20 text-[#1f1f1f]">
        <div className="mx-auto max-w-5xl">
          <p className="text-lg">Sjekker innlogging...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f3f3f3] text-[#1f1f1f]">
      <header className="sticky top-0 z-50 border-b border-black/10 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <nav className="flex flex-wrap items-center gap-2">
            <Link href="/dashboard" className={navClass("/dashboard")}>
              Dashboard
            </Link>
            <Link
              href="/dashboard/sessions"
              className={navClass("/dashboard/sessions")}
            >
              Mine økter
            </Link>
            <Link
              href="/dashboard/exercises"
              className={navClass("/dashboard/exercises")}
            >
              Øvelsesbank
            </Link>
          </nav>

          <button
            onClick={handleLogout}
            className="text-sm font-medium transition hover:text-black/60"
          >
            Logg ut
          </button>
        </div>
      </header>

      {children}
    </main>
  );
}