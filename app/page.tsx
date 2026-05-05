"use client";

import Link from "next/link";
import Header from "@/components/Header";
import { useAuth, useBookings } from "@/lib/store";
import type { Booking } from "@/lib/types";

export default function HomePage() {
  const { isSignedIn, user } = useAuth();
  const { bookings } = useBookings();

  return (
    <div className="min-h-dvh flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-br from-brand via-brand to-brand-dark text-white">
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-accent/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-10 w-64 h-64 rounded-full bg-brand-light/30 blur-3xl pointer-events-none" />

          <div className="relative max-w-md mx-auto px-5 pt-10 pb-14">
            <span className="inline-flex items-center gap-2 text-[11px] tracking-wider uppercase font-medium bg-white/10 border border-white/15 backdrop-blur px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              Premium stays · إقامة مميزة
            </span>

            <h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight">
              {isSignedIn ? `Welcome, ${user?.name}` : "Layali Hotel"}
            </h1>
            <p className="mt-1 text-2xl font-semibold text-white/90" dir="rtl">
              {isSignedIn ? "أهلاً بك" : "فندق ليالي"}
            </p>

            <p className="mt-5 text-sm text-white/80 leading-relaxed">
              Comfortable stays. Easy bookings. Right at your fingertips.
            </p>
            <p className="text-sm text-white/80 leading-relaxed" dir="rtl">
              إقامة مريحة. حجز سهل. بين يديك.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-2.5">
              <Link
                href="/rooms"
                className="block w-full text-center bg-white text-brand font-semibold py-3.5 rounded-xl shadow-sm hover:bg-slate-50 active:scale-[0.99] transition"
              >
                Book Now · احجز الآن
              </Link>
              {!isSignedIn && (
                <Link
                  href="/signin"
                  className="block w-full text-center bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur text-white font-medium py-3 rounded-xl transition"
                >
                  Sign in · تسجيل الدخول
                </Link>
              )}
            </div>

            <div className="mt-7 grid grid-cols-3 gap-2 text-center">
              <Stat numEn="4" labelEn="Room types" labelAr="أنواع غرف" />
              <Stat numEn="24/7" labelEn="Support" labelAr="دعم" />
              <Stat numEn="< 1m" labelEn="To book" labelAr="للحجز" />
            </div>
          </div>
        </section>

        {bookings.length > 0 && (
          <section className="max-w-md mx-auto px-5 pt-8 pb-2">
            <div className="flex items-baseline justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  My bookings
                </h2>
                <p className="text-sm text-slate-500" dir="rtl">حجوزاتي</p>
              </div>
              <span className="text-xs text-slate-500">
                {bookings.length}{" "}
                {bookings.length === 1 ? "booking" : "bookings"}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {bookings.map((b) => (
                <BookingItem key={b.id} booking={b} />
              ))}
            </div>

            <Link
              href="/rooms"
              className="mt-4 block w-full text-center text-sm text-brand font-semibold py-2 hover:underline"
            >
              + Book another room · احجز غرفة أخرى
            </Link>
          </section>
        )}

        <section className="max-w-md mx-auto px-5 py-10 space-y-4">
          <div className="text-center">
            <h2 className="text-xl font-bold text-slate-900">Why Layali?</h2>
            <p className="text-sm text-slate-500" dir="rtl">لماذا ليالي؟</p>
          </div>

          <Feature
            icon="🛏"
            titleEn="Variety of rooms"
            titleAr="تنوع في الغرف"
            descEn="From cozy singles to spacious family rooms."
            descAr="من غرف فردية مريحة إلى غرف عائلية واسعة."
          />
          <Feature
            icon="⚡"
            titleEn="Quick reservation"
            titleAr="حجز سريع"
            descEn="Reserve in under a minute, no friction."
            descAr="احجز خلال أقل من دقيقة، بدون تعقيد."
          />
          <Feature
            icon="📞"
            titleEn="Direct contact"
            titleAr="تواصل مباشر"
            descEn="We'll reach out by phone to confirm your stay."
            descAr="نتواصل معك هاتفياً لتأكيد إقامتك."
          />
        </section>
      </main>

      <footer className="max-w-md mx-auto w-full px-5 py-6 text-center text-xs text-slate-500">
        <p>© Layali Hotel</p>
        <p dir="rtl">جميع الحقوق محفوظة</p>
      </footer>
    </div>
  );
}

function Stat({
  numEn,
  labelEn,
  labelAr,
}: {
  numEn: string;
  labelEn: string;
  labelAr: string;
}) {
  return (
    <div className="bg-white/10 border border-white/15 rounded-xl py-2.5 px-2 backdrop-blur">
      <div className="text-base font-bold text-white">{numEn}</div>
      <div className="text-[10px] uppercase tracking-wide text-white/70 leading-tight">
        {labelEn}
      </div>
      <div className="text-[10px] text-white/70 leading-tight" dir="rtl">
        {labelAr}
      </div>
    </div>
  );
}

function BookingItem({ booking }: { booking: Booking }) {
  const isPending = booking.status === "pending";
  return (
    <Link
      href={`/confirmation/${booking.id}`}
      className="card card-hover block p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                isPending
                  ? "bg-amber-100 text-amber-800"
                  : "bg-emerald-100 text-emerald-800"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isPending ? "bg-amber-500" : "bg-emerald-500"
                }`}
              />
              {isPending ? "Pending · قيد المعالجة" : "Done · مؤكد"}
            </span>
          </div>
          <h3 className="mt-2 text-base font-semibold text-slate-900 truncate">
            {booking.roomNameEn}
          </h3>
          <p className="text-sm text-slate-500 truncate" dir="rtl">
            {booking.roomNameAr}
          </p>
          <div className="mt-2 flex items-center gap-3 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1">
              <span aria-hidden>📅</span>
              {booking.checkIn}
            </span>
            <span className="inline-flex items-center gap-1">
              <span aria-hidden>📞</span>
              {booking.phone}
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
            Ref · رقم
          </div>
          <div className="mt-0.5 text-sm font-mono font-bold text-brand">
            {booking.ref}
          </div>
          <div className="mt-2 text-xs text-slate-400">→</div>
        </div>
      </div>
    </Link>
  );
}

function Feature({
  icon,
  titleEn,
  titleAr,
  descEn,
  descAr,
}: {
  icon: string;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
}) {
  return (
    <div className="card card-hover p-4 flex items-start gap-3">
      <div className="shrink-0 w-11 h-11 rounded-xl bg-brand-soft text-brand flex items-center justify-center text-xl">
        {icon}
      </div>
      <div className="min-w-0">
        <h3 className="font-semibold text-slate-900">{titleEn}</h3>
        <p className="text-sm text-slate-500" dir="rtl">{titleAr}</p>
        <p className="mt-1.5 text-sm text-slate-700">{descEn}</p>
        <p className="text-sm text-slate-700" dir="rtl">{descAr}</p>
      </div>
    </div>
  );
}
