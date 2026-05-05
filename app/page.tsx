"use client";

import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import RoomCard from "@/components/RoomCard";
import { ambianceImageUrl, heroImageUrl, rooms } from "@/lib/rooms";
import { useAuth, useBookings } from "@/lib/store";
import type { Booking } from "@/lib/types";

export default function HomePage() {
  const { isSignedIn, user } = useAuth();
  const { bookings } = useBookings();
  const featuredRooms = rooms.slice(0, 3);

  return (
    <div className="min-h-dvh flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="relative">
          <div className="container-page pt-8 pb-10 lg:pt-14 lg:pb-20">
            <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-center">
              <div className="lg:col-span-6 lg:pr-6 order-2 lg:order-1">
                <span className="eyebrow text-brand">
                  <span className="w-6 h-px bg-brand" />
                  Boutique stays · إقامة بوتيك
                </span>

                <h1 className="display-serif mt-5 text-4xl sm:text-5xl lg:text-6xl font-semibold text-ink leading-[1.05]">
                  {isSignedIn ? `Welcome back, ${user?.name}.` : "Slow down. Stay a while."}
                </h1>
                <p
                  className="display-serif mt-2 text-2xl sm:text-3xl lg:text-4xl text-ink-muted"
                  dir="rtl"
                >
                  {isSignedIn ? "أهلاً بعودتك." : "ليالي تستحق التوقف."}
                </p>

                <p className="mt-6 text-base text-ink-muted leading-relaxed max-w-md">
                  A small, warm hotel where every stay feels considered. Curated
                  rooms, golden light, and a quiet welcome.
                </p>
                <p
                  className="mt-2 text-base text-ink-muted leading-relaxed max-w-md"
                  dir="rtl"
                >
                  فندق صغير ودافئ، كل تفصيلة فيه مدروسة. غرف منتقاة، ضوء ذهبي،
                  وترحيب هادئ.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/rooms" className="btn-primary">
                    Reserve a stay · احجز إقامتك
                  </Link>
                  {!isSignedIn && (
                    <Link href="/signup" className="btn-outline">
                      Create account
                    </Link>
                  )}
                </div>

                <dl className="mt-10 grid grid-cols-3 gap-6 max-w-md">
                  <Stat numEn="4" labelEn="Room types" labelAr="غرف" />
                  <Stat numEn="24/7" labelEn="Concierge" labelAr="استقبال" />
                  <Stat numEn="< 1m" labelEn="To book" labelAr="حجز سريع" />
                </dl>
              </div>

              <div className="lg:col-span-6 order-1 lg:order-2">
                <div className="relative aspect-[4/5] sm:aspect-[16/10] lg:aspect-[4/5] rounded-3xl overflow-hidden bg-sand">
                  <Image
                    src={heroImageUrl}
                    alt="Layali Hotel ambiance"
                    fill
                    priority
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5 text-white">
                    <span className="eyebrow text-white/90">Suite · جناح</span>
                    <p className="display-serif text-2xl font-semibold mt-1">
                      Golden hour, every evening.
                    </p>
                    <p className="text-sm text-white/85 mt-1" dir="rtl">
                      ساعة ذهبية، كل مساء.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {bookings.length > 0 && (
          <section className="container-page pt-2 pb-8">
            <div className="flex items-baseline justify-between gap-3 mb-5">
              <div>
                <span className="eyebrow text-accent">Yours · حجوزاتك</span>
                <h2 className="display-serif mt-1 text-3xl font-semibold text-ink">
                  My bookings
                </h2>
              </div>
              <span className="text-xs text-ink-muted">
                {bookings.length} {bookings.length === 1 ? "booking" : "bookings"}
              </span>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {bookings.map((b) => (
                <BookingItem key={b.id} booking={b} />
              ))}
            </div>

            <Link
              href="/rooms"
              className="mt-5 inline-flex items-center gap-1.5 text-sm text-brand font-semibold hover:underline"
            >
              + Book another room · احجز غرفة أخرى
            </Link>
          </section>
        )}

        <section className="container-page py-12 lg:py-20">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <span className="eyebrow text-brand">Stay · غرفنا</span>
              <h2 className="display-serif mt-1 text-3xl sm:text-4xl font-semibold text-ink">
                Featured rooms
              </h2>
              <p className="text-sm text-ink-muted mt-1" dir="rtl">
                غرف مختارة بعناية
              </p>
            </div>
            <Link
              href="/rooms"
              className="hidden sm:inline-flex text-sm text-ink-muted hover:text-ink font-medium"
            >
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredRooms.map((r) => (
              <RoomCard key={r.id} room={r} />
            ))}
          </div>

          <Link
            href="/rooms"
            className="sm:hidden mt-5 inline-flex text-sm text-ink-muted hover:text-ink font-medium"
          >
            View all rooms →
          </Link>
        </section>

        <section className="bg-sand-light border-y border-sand">
          <div className="container-page py-12 lg:py-20">
            <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              <div className="lg:col-span-5 relative aspect-[4/5] rounded-3xl overflow-hidden bg-sand">
                <Image
                  src={ambianceImageUrl}
                  alt="Cozy boutique interior"
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="lg:col-span-7">
                <span className="eyebrow text-accent">Why Layali · لماذا ليالي</span>
                <h2 className="display-serif mt-2 text-3xl sm:text-4xl font-semibold text-ink">
                  Small details. Warm welcome.
                </h2>
                <p className="display-serif text-2xl text-ink-muted mt-1" dir="rtl">
                  تفاصيل صغيرة. ترحيب دافئ.
                </p>

                <div className="mt-8 grid sm:grid-cols-2 gap-5">
                  <Feature
                    icon={<IconBed />}
                    titleEn="Curated rooms"
                    titleAr="غرف منتقاة"
                    descEn="From single retreats to family suites, every space is intentional."
                    descAr="من غرف للأفراد إلى أجنحة عائلية، كل مساحة مدروسة."
                  />
                  <Feature
                    icon={<IconBolt />}
                    titleEn="Quick reservation"
                    titleAr="حجز سريع"
                    descEn="Reserve in under a minute, no friction."
                    descAr="احجز خلال أقل من دقيقة، بدون تعقيد."
                  />
                  <Feature
                    icon={<IconPhone />}
                    titleEn="Direct contact"
                    titleAr="تواصل مباشر"
                    descEn="We call you to confirm — no inbox lottery."
                    descAr="نتصل بك للتأكيد — بدون انتظار."
                  />
                  <Feature
                    icon={<IconLeaf />}
                    titleEn="Calm by design"
                    titleAr="هدوء بالتصميم"
                    descEn="Quiet hours, soft light, real linens."
                    descAr="ساعات هدوء، إضاءة دافئة، أقمشة أصيلة."
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="container-page py-8 text-center text-xs text-ink-muted border-t border-sand">
        <p className="display-serif text-base text-ink">Layali Hotel · فندق ليالي</p>
        <p className="mt-1">© All rights reserved · جميع الحقوق محفوظة</p>
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
    <div>
      <div className="display-serif text-3xl font-semibold text-ink">{numEn}</div>
      <div className="text-[10px] uppercase tracking-[0.18em] text-ink-muted mt-1">
        {labelEn}
      </div>
      <div className="text-[10px] text-ink-muted" dir="rtl">{labelAr}</div>
    </div>
  );
}

function BookingItem({ booking }: { booking: Booking }) {
  const isPending = booking.status === "pending";
  return (
    <Link
      href={`/confirmation/${booking.id}`}
      className="card card-hover block p-5"
    >
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.15em] ${
            isPending
              ? "bg-brand-soft text-brand-dark"
              : "bg-accent-soft text-accent-dark"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isPending ? "bg-brand" : "bg-accent"
            }`}
          />
          {isPending ? "Pending" : "Confirmed"}
        </span>
      </div>
      <h3 className="display-serif mt-3 text-xl font-semibold text-ink truncate">
        {booking.roomNameEn}
      </h3>
      <p className="text-sm text-ink-muted truncate" dir="rtl">
        {booking.roomNameAr}
      </p>
      <div className="mt-3 flex items-center justify-between gap-2 text-xs text-ink-muted">
        <span>📅 {booking.checkIn}</span>
        <span className="font-mono font-semibold text-brand">{booking.ref}</span>
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
  icon: React.ReactNode;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="shrink-0 w-10 h-10 rounded-xl bg-white border border-sand text-accent flex items-center justify-center">
        {icon}
      </div>
      <div className="min-w-0">
        <h3 className="font-semibold text-ink">{titleEn}</h3>
        <p className="text-xs text-ink-muted mt-0.5" dir="rtl">{titleAr}</p>
        <p className="mt-1.5 text-sm text-ink-muted leading-relaxed">{descEn}</p>
        <p className="text-sm text-ink-muted leading-relaxed" dir="rtl">{descAr}</p>
      </div>
    </div>
  );
}

function IconBed() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4v16" />
      <path d="M2 8h18a2 2 0 0 1 2 2v10" />
      <path d="M2 17h20" />
      <path d="M6 8v0a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v0" />
    </svg>
  );
}
function IconBolt() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h7l-1 8 11-12h-7l0-8z" />
    </svg>
  );
}
function IconPhone() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}
function IconLeaf() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 4 13c0-7 7-11 17-11 0 10-4 17-10 17a6 6 0 0 1-5-3" />
      <path d="M2 22c4-4 7-9 14-12" />
    </svg>
  );
}
