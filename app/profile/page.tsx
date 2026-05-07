"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  History,
  LogOut,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import Header from "@/components/Header";
import { useAuth, useBookings } from "@/lib/store";
import type { Booking } from "@/lib/types";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isSignedIn, isAdmin, loading, signOut } = useAuth();
  const { bookings } = useBookings();

  useEffect(() => {
    if (loading) return;
    if (!isSignedIn) router.replace("/signin?next=/profile");
  }, [loading, isSignedIn, router]);

  const { upcoming, past } = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const upcoming = bookings
      .filter((b) => b.checkIn >= today)
      .sort((a, b) => a.checkIn.localeCompare(b.checkIn));
    const past = bookings
      .filter((b) => b.checkIn < today)
      .sort((a, b) => b.checkIn.localeCompare(a.checkIn));
    return { upcoming, past };
  }, [bookings]);

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  if (loading || !user) {
    return (
      <div className="min-h-dvh flex flex-col">
        <Header />
        <main className="flex-1 container-page py-16">
          <p className="text-sm text-ink-muted">Loading… · جاري التحميل…</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container-page pt-6 pb-16">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Home · الرئيسية
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-4 max-w-2xl"
          >
            <span className="eyebrow text-brand">
              <span className="w-6 h-px bg-brand" /> Profile · الملف الشخصي
            </span>
            <h1 className="display-serif mt-3 text-4xl sm:text-5xl font-extrabold text-ink leading-[1.05]">
              Your account
            </h1>
            <p
              className="display-serif text-2xl sm:text-3xl text-ink-muted mt-1"
              dir="rtl"
            >
              ملفك الشخصي
            </p>
          </motion.div>

          <div className="mt-8 grid lg:grid-cols-12 gap-6 lg:gap-8">
            <motion.aside
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="lg:col-span-4 lg:sticky lg:top-24 self-start space-y-4"
            >
              <div className="card p-6">
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-2xl bg-brand text-white flex items-center justify-center text-2xl font-bold shadow-soft">
                    {(user.name?.[0] ?? "?").toUpperCase()}
                    {isAdmin && (
                      <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-accent text-white border-2 border-white flex items-center justify-center">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="display-serif text-2xl font-bold text-ink truncate">
                      {user.name}
                    </h2>
                    {isAdmin ? (
                      <span className="pill bg-accent-soft text-accent-dark mt-1">
                        <Sparkles className="w-3 h-3" /> Admin · مشرف
                      </span>
                    ) : (
                      <span className="pill bg-sand-light text-ink mt-1">
                        Guest · ضيف
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-6 space-y-4 text-sm">
                  <Detail
                    icon={<Mail className="w-4 h-4" />}
                    labelEn="Email"
                    labelAr="البريد"
                  >
                    <span className="break-all text-ink">{user.email}</span>
                  </Detail>
                  <Detail
                    icon={<User className="w-4 h-4" />}
                    labelEn="Name"
                    labelAr="الاسم"
                  >
                    {user.name}
                  </Detail>
                  <Detail
                    icon={<CalendarDays className="w-4 h-4" />}
                    labelEn="Total bookings"
                    labelAr="مجموع الحجوزات"
                  >
                    {bookings.length}{" "}
                    <span className="text-xs text-ink-muted" dir="rtl">
                      ({upcoming.length} قادمة · {past.length} سابقة)
                    </span>
                  </Detail>
                </div>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="mt-6 w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-ink text-white font-semibold hover:bg-brand transition active:scale-[0.99]"
                >
                  <LogOut className="w-4 h-4" /> Sign out · تسجيل الخروج
                </button>
              </div>

              {isAdmin && (
                <Link
                  href="/admin"
                  className="card card-lift p-5 flex items-center gap-3 group"
                >
                  <span className="w-10 h-10 rounded-2xl bg-brand-soft text-brand flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <p className="font-bold text-ink">Open admin dashboard</p>
                    <p className="text-xs text-ink-muted" dir="rtl">
                      افتح لوحة المشرف
                    </p>
                  </span>
                  <ArrowRight className="w-4 h-4 text-ink-muted transition-transform group-hover:translate-x-0.5" />
                </Link>
              )}
            </motion.aside>

            <motion.section
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-8 space-y-10"
            >
              <BookingsSection
                title="Upcoming stays"
                titleAr="حجوزات قادمة"
                icon={<CalendarClock className="w-5 h-5" />}
                bookings={upcoming}
                emptyEn="No upcoming bookings yet."
                emptyAr="ما عندك حجوزات قادمة."
                accent
              />

              <BookingsSection
                title="Past stays"
                titleAr="حجوزات سابقة"
                icon={<History className="w-5 h-5" />}
                bookings={past}
                emptyEn="No past bookings."
                emptyAr="ما عندك حجوزات سابقة."
              />
            </motion.section>
          </div>
        </div>
      </main>
    </div>
  );
}

function Detail({
  icon,
  labelEn,
  labelAr,
  children,
}: {
  icon: React.ReactNode;
  labelEn: string;
  labelAr: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="shrink-0 w-8 h-8 rounded-lg bg-sand-light text-ink-muted flex items-center justify-center mt-0.5">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] uppercase tracking-[0.2em] text-ink-muted font-semibold">
          {labelEn} · <span dir="rtl">{labelAr}</span>
        </div>
        <div className="mt-0.5 font-semibold text-ink">{children}</div>
      </div>
    </div>
  );
}

function BookingsSection({
  title,
  titleAr,
  icon,
  bookings,
  emptyEn,
  emptyAr,
  accent,
}: {
  title: string;
  titleAr: string;
  icon: React.ReactNode;
  bookings: Booking[];
  emptyEn: string;
  emptyAr: string;
  accent?: boolean;
}) {
  return (
    <section>
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <span
            className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              accent ? "bg-brand text-white" : "bg-sand-light text-ink-muted"
            }`}
          >
            {icon}
          </span>
          <div>
            <h2 className="display-serif text-2xl font-bold text-ink leading-tight">
              {title}
            </h2>
            <p className="text-xs text-ink-muted" dir="rtl">
              {titleAr}
            </p>
          </div>
        </div>
        <span className="text-xs text-ink-muted">
          {bookings.length} {bookings.length === 1 ? "booking" : "bookings"}
        </span>
      </div>

      {bookings.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-sm text-ink-muted">{emptyEn}</p>
          <p className="text-sm text-ink-muted mt-1" dir="rtl">
            {emptyAr}
          </p>
          {accent && (
            <Link href="/rooms" className="btn-primary mt-5 inline-flex">
              Book a room · احجز غرفة
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {bookings.map((b, i) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <BookingCard booking={b} />
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}

function BookingCard({ booking }: { booking: Booking }) {
  const isPending = booking.status === "pending";
  return (
    <Link
      href={`/confirmation/${booking.id}`}
      className="card card-lift block p-5 group"
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={`pill ${
            isPending
              ? "bg-accent-soft text-accent-dark"
              : "bg-brand-soft text-brand-ink"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isPending ? "bg-accent" : "bg-brand"
            }`}
          />
          {isPending ? "Pending" : "Confirmed"}
        </span>
        <span className="font-mono text-xs font-bold text-ink-muted">
          {booking.ref}
        </span>
      </div>
      <h3 className="display-serif mt-4 text-xl font-bold text-ink truncate">
        {booking.roomNameEn}
      </h3>
      <p className="text-sm text-ink-muted truncate" dir="rtl">
        {booking.roomNameAr}
      </p>
      <div className="mt-4 flex items-center justify-between text-xs text-ink-muted">
        <span className="inline-flex items-center gap-1.5">
          <CalendarCheck className="w-3.5 h-3.5" />
          {booking.checkIn}
        </span>
        <span className="inline-flex items-center gap-1.5 font-semibold text-brand transition-transform group-hover:translate-x-0.5">
          Details <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  );
}
