"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, Menu, ShieldCheck, Sparkles, User as UserIcon, X } from "lucide-react";
import { useAuth } from "@/lib/store";

export default function Header() {
  const { isSignedIn, isAdmin, user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-white/85 backdrop-blur-md border-b border-black/5 shadow-soft"
          : "bg-transparent"
      }`}
    >
      <div className="container-page py-3 sm:py-4 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <span className="relative w-10 h-10 rounded-2xl bg-brand text-white flex items-center justify-center shadow-soft transition group-hover:bg-brand-dark">
            <Sparkles className="w-5 h-5" strokeWidth={2.2} />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="display-serif text-lg font-bold text-ink">Layali</span>
            <span
              className="text-[10px] tracking-[0.22em] uppercase text-ink-muted font-medium"
              dir="rtl"
            >
              فندق ليالي
            </span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 text-sm">
          <NavLink href="/" active={pathname === "/"}>Home · الرئيسية</NavLink>
          <NavLink href="/rooms" active={pathname?.startsWith("/rooms")}>
            Rooms · الغرف
          </NavLink>
          {isSignedIn && (
            <NavLink href="/profile" active={pathname?.startsWith("/profile")}>
              <UserIcon className="w-3.5 h-3.5" />
              Profile · الملف
            </NavLink>
          )}
          {isAdmin && (
            <NavLink href="/admin" active={pathname?.startsWith("/admin")} accent>
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin · المشرف
            </NavLink>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {isSignedIn ? (
            <>
              <Link
                href="/profile"
                className="inline-flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-sand-light border border-black/5 hover:bg-white transition"
                title="Profile"
              >
                <span className="w-7 h-7 rounded-full bg-brand text-white text-xs font-bold flex items-center justify-center">
                  {(user?.name?.[0] ?? "?").toUpperCase()}
                </span>
                <span className="text-xs font-semibold text-ink truncate max-w-[8rem]">
                  {user?.name}
                </span>
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="btn-icon"
                title="Sign out · خروج"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <Link href="/signin" className="btn-ghost text-sm">
                Sign in
              </Link>
              <Link href="/signup" className="btn-primary text-sm py-2.5 px-5">
                Sign up · سجّل
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="md:hidden btn-icon"
          aria-label="Menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-black/5 bg-white/95 backdrop-blur-md animate-fade-up">
          <div className="container-page py-4 flex flex-col gap-1">
            <MobileLink href="/">Home · الرئيسية</MobileLink>
            <MobileLink href="/rooms">Rooms · الغرف</MobileLink>
            {isSignedIn && (
              <MobileLink href="/profile">
                <UserIcon className="w-4 h-4" /> Profile · الملف
              </MobileLink>
            )}
            {isAdmin && (
              <MobileLink href="/admin">
                <ShieldCheck className="w-4 h-4" /> Admin · المشرف
              </MobileLink>
            )}
            <div className="h-px bg-black/5 my-2" />
            {isSignedIn ? (
              <>
                <div className="px-3 py-2 text-xs text-ink-muted">
                  Signed in as <span className="font-semibold text-ink">{user?.name}</span>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="px-3 py-2.5 rounded-xl text-sm font-semibold text-left flex items-center gap-2 hover:bg-sand-light"
                >
                  <LogOut className="w-4 h-4" /> Sign out · تسجيل الخروج
                </button>
              </>
            ) : (
              <>
                <MobileLink href="/signin">Sign in · تسجيل الدخول</MobileLink>
                <MobileLink href="/signup">Sign up · إنشاء حساب</MobileLink>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function NavLink({
  href,
  active,
  accent,
  children,
}: {
  href: string;
  active?: boolean;
  accent?: boolean;
  children: React.ReactNode;
}) {
  const base =
    "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold transition";
  if (accent) {
    return (
      <Link
        href={href}
        className={`${base} ${
          active ? "bg-brand text-white" : "bg-brand-soft text-brand-ink hover:bg-brand/15"
        }`}
      >
        {children}
      </Link>
    );
  }
  return (
    <Link
      href={href}
      className={`${base} ${
        active ? "bg-ink text-white" : "text-ink-muted hover:text-ink hover:bg-sand-light"
      }`}
    >
      {children}
    </Link>
  );
}

function MobileLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="px-3 py-2.5 rounded-xl text-sm font-semibold text-ink hover:bg-sand-light flex items-center gap-2"
    >
      {children}
    </Link>
  );
}
