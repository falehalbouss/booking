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
    <header className="sticky top-0 z-30 backdrop-blur bg-[#FBF7F1]/80 border-b border-sand">
      <div className="container-page py-3.5 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <span className="w-9 h-9 rounded-full bg-brand text-white flex items-center justify-center font-serif text-lg font-bold group-hover:bg-brand-dark transition">
            L
          </span>
          <span className="flex flex-col leading-tight">
            <span className="display-serif text-lg font-bold text-ink">Layali</span>
            <span className="text-[10px] tracking-[0.2em] uppercase text-ink-muted" dir="rtl">
              فندق ليالي
            </span>
          </span>
        </Link>

        <nav className="hidden sm:flex items-center gap-1 text-sm">
          <Link href="/" className="px-3 py-2 text-ink-muted hover:text-ink transition">
            Home
          </Link>
          <Link href="/rooms" className="px-3 py-2 text-ink-muted hover:text-ink transition">
            Rooms
          </Link>
        </nav>

        <div className="flex items-center gap-2 text-xs">
          {isSignedIn ? (
            <>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sand-light text-ink-muted">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                {user?.name}
              </span>
              <button
                type="button"
                onClick={handleSignOut}
                className="px-3 py-1.5 rounded-lg bg-ink text-white hover:bg-ink-muted transition font-medium"
              >
                Sign out · خروج
              </button>
            </>
          ) : (
            <>
              <Link
                href="/signin"
                className="px-3 py-1.5 rounded-lg text-ink hover:bg-sand-light transition font-medium"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="hidden xs:inline-flex px-3 py-1.5 rounded-lg bg-brand text-white hover:bg-brand-dark transition font-medium"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
