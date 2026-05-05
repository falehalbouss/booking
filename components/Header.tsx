"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/store";

export default function Header() {
  const { isSignedIn, user, signOut } = useAuth();
  const router = useRouter();

  function handleSignOut() {
    signOut();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-brand/95 text-white shadow-md">
      <div className="max-w-md mx-auto px-4 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-base font-bold group-hover:bg-white/25 transition">
            L
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-base font-semibold tracking-tight">Layali Hotel</span>
            <span className="text-[11px] opacity-90" dir="rtl">فندق ليالي</span>
          </span>
        </Link>

        <div className="flex items-center gap-2 text-xs">
          {isSignedIn ? (
            <>
              <span className="hidden xs:inline px-2 py-1 rounded bg-white/10">
                {user?.name}
              </span>
              <button
                type="button"
                onClick={handleSignOut}
                className="px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 transition font-medium"
              >
                Sign out · خروج
              </button>
            </>
          ) : (
            <Link
              href="/signin"
              className="px-3 py-1.5 rounded-lg bg-white text-brand hover:bg-slate-100 transition font-medium"
            >
              Sign in · دخول
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
