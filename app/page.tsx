"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BedDouble,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  Headset,
  MapPin,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import HeroCarousel from "@/components/HeroCarousel";
import RoomCard from "@/components/RoomCard";
import { ambianceImageUrl, rooms } from "@/lib/rooms";
import { useAuth, useBookings } from "@/lib/store";
import type { Booking } from "@/lib/types";

export default function HomePage() {
  const { isSignedIn, user } = useAuth();
  const { bookings } = useBookings();
  const featuredRooms = rooms.slice(0, 3);

  return (
    <div className="min-h-dvh flex flex-col">
      <div className="relative">
        <Header />
        <section className="relative h-[88dvh] sm:h-[92dvh] -mt-[64px] sm:-mt-[72px]">
          <HeroCarousel />
          <div className="absolute inset-x-0 top-0 h-[64px] sm:h-[72px]" />
          <div className="absolute inset-x-0 bottom-0 z-20 px-5 sm:px-10 lg:px-16 pb-28 sm:pb-36 lg:pb-44 pointer-events-none">
            <div className="container-page mx-auto">
              <div className="flex flex-wrap items-end justify-between gap-4 pointer-events-auto">
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
                  className="flex flex-wrap gap-3"
                >
                  <Link
                    href="/rooms"
                    className="btn-primary group bg-white text-brand hover:bg-white/90"
                  >
                    {isSignedIn ? "Book a stay · احجز" : "Get started · ابدأ الآن"}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <Link
                    href="/rooms"
                    className="btn-outline bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20"
                  >
                    Explore rooms · تصفح الغرف
                  </Link>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55, duration: 0.6, ease: "easeOut" }}
                  className="hidden lg:inline-flex items-center gap-3 glass rounded-full pl-2 pr-4 py-2 text-white border-white/30 bg-white/10 whitespace-nowrap"
                >
                  <span className="flex -space-x-2">
                    {["A", "M", "S"].map((c, i) => (
                      <span
                        key={i}
                        className="w-7 h-7 rounded-full bg-white text-ink text-[11px] font-bold flex items-center justify-center border-2 border-white/60"
                      >
                        {c}
                      </span>
                    ))}
                  </span>
                  <span className="text-xs font-medium">
                    Loved by 1k+ guests · أحبّه آلاف الضيوف
                  </span>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <main className="flex-1">
        <section className="container-page -mt-12 sm:-mt-16 relative z-30">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="card p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-3"
          >
            <SearchField icon={<MapPin className="w-4 h-4" />} labelEn="Where" labelAr="المكان">
              <input
                className="bg-transparent w-full outline-none text-sm font-semibold text-ink placeholder:text-ink-soft"
                defaultValue="Layali Hotel · ليالي"
              />
            </SearchField>
            <SearchField icon={<CalendarCheck className="w-4 h-4" />} labelEn="Check-in" labelAr="الوصول">
              <input
                type="date"
                className="bg-transparent w-full outline-none text-sm font-semibold text-ink"
              />
            </SearchField>
            <SearchField icon={<CalendarCheck className="w-4 h-4" />} labelEn="Check-out" labelAr="المغادرة">
              <input
                type="date"
                className="bg-transparent w-full outline-none text-sm font-semibold text-ink"
              />
            </SearchField>
            <Link
              href="/rooms"
              className="btn-primary justify-center w-full sm:w-auto"
            >
              <Sparkles className="w-4 h-4" /> Search · بحث
            </Link>
          </motion.div>
        </section>

        {bookings.length > 0 && (
          <section className="container-page pt-12 sm:pt-16">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex items-baseline justify-between gap-3 mb-5"
            >
              <div>
                <span className="eyebrow text-accent-dark">
                  Yours · حجوزاتك
                </span>
                <h2 className="display-serif mt-1.5 text-3xl font-bold text-ink">
                  Welcome back, {user?.name}
                </h2>
              </div>
              <span className="text-xs text-ink-muted">
                {bookings.length}{" "}
                {bookings.length === 1 ? "booking" : "bookings"}
              </span>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {bookings.slice(0, 3).map((b, i) => (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: i * 0.08 }}
                >
                  <BookingItem booking={b} />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        <section className="container-page py-16 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="flex items-end justify-between gap-4 mb-10"
          >
            <div>
              <span className="eyebrow text-brand">
                <span className="w-6 h-px bg-brand" />
                Featured stays · إقامات مميّزة
              </span>
              <h2 className="display-serif mt-3 text-3xl sm:text-5xl font-bold text-ink leading-[1.05]">
                Find the perfect room
              </h2>
              <p
                className="display-serif text-2xl sm:text-3xl text-ink-muted mt-1"
                dir="rtl"
              >
                اختر الغرفة المثالية
              </p>
            </div>
            <Link
              href="/rooms"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink font-semibold group"
            >
              View all
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredRooms.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.55, delay: i * 0.1 }}
              >
                <RoomCard room={r} />
              </motion.div>
            ))}
          </div>

          <Link
            href="/rooms"
            className="sm:hidden mt-6 inline-flex items-center gap-1.5 text-sm text-ink-muted font-semibold"
          >
            View all rooms <ArrowRight className="w-4 h-4" />
          </Link>
        </section>

        <section className="relative">
          <div className="absolute inset-0 bg-brand">
            <div className="absolute inset-0 opacity-20 mix-blend-overlay">
              <Image
                src={ambianceImageUrl}
                alt=""
                fill
                sizes="100vw"
                className="object-cover"
              />
            </div>
          </div>
          <div className="relative container-page py-16 lg:py-24">
            <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6 }}
                className="lg:col-span-5 relative aspect-[4/5] rounded-4xl overflow-hidden bg-sand shadow-lift"
              >
                <Image
                  src={ambianceImageUrl}
                  alt="Layali ambiance"
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute bottom-5 left-5 right-5 glass rounded-3xl p-4 text-ink">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="eyebrow text-brand">Now booking</span>
                      <p className="display-serif text-xl font-bold mt-1">
                        Spring rates · أسعار الربيع
                      </p>
                    </div>
                    <span className="pill-brand">-15%</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="lg:col-span-7 text-white"
              >
                <span className="eyebrow text-white/85">
                  Why Layali · لماذا ليالي
                </span>
                <h2 className="display-serif mt-3 text-4xl sm:text-5xl font-bold leading-[1.05]">
                  Small details. Warm welcome.
                </h2>
                <p
                  className="display-serif text-2xl sm:text-3xl text-white/85 mt-1"
                  dir="rtl"
                >
                  تفاصيل صغيرة. ترحيب دافئ.
                </p>

                <div className="mt-10 grid sm:grid-cols-2 gap-5">
                  <Feature
                    icon={<BedDouble />}
                    titleEn="Curated rooms"
                    titleAr="غرف منتقاة"
                    descEn="Every space is designed with intention and care."
                    descAr="كل مساحة صُمّمت بنيّة واهتمام."
                  />
                  <Feature
                    icon={<Clock3 />}
                    titleEn="Quick reservation"
                    titleAr="حجز سريع"
                    descEn="Reserve in under a minute, no friction."
                    descAr="احجز خلال أقل من دقيقة، بدون تعقيد."
                  />
                  <Feature
                    icon={<Headset />}
                    titleEn="Direct contact"
                    titleAr="تواصل مباشر"
                    descEn="We call you to confirm — no inbox lottery."
                    descAr="نتصل بك للتأكيد — بدون انتظار."
                  />
                  <Feature
                    icon={<CheckCircle2 />}
                    titleEn="Calm by design"
                    titleAr="هدوء بالتصميم"
                    descEn="Quiet hours, soft light, real linens."
                    descAr="ساعات هدوء، إضاءة دافئة، أقمشة أصيلة."
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="container-page py-16 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto"
          >
            <span className="eyebrow text-brand justify-center">
              <span className="w-6 h-px bg-brand" /> Ready · جاهز
            </span>
            <h2 className="display-serif mt-3 text-4xl sm:text-5xl font-bold text-ink leading-[1.05]">
              Stay a while.
            </h2>
            <p
              className="display-serif text-2xl sm:text-3xl text-ink-muted mt-1"
              dir="rtl"
            >
              امكث لبعض الوقت.
            </p>
            <p className="mt-5 text-base text-ink-muted">
              Pick a room, pick a date, we&apos;ll handle the rest.
            </p>
            <p className="text-base text-ink-muted" dir="rtl">
              اختر غرفة، اختر تاريخ، ونحن نتولّى الباقي.
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <Link href="/rooms" className="btn-primary group">
                Reserve now · احجز الآن
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="container-page py-10 text-center text-xs text-ink-muted border-t border-black/5">
        <p className="display-serif text-base text-ink">
          Layali Hotel · فندق ليالي
        </p>
        <p className="mt-1">© All rights reserved · جميع الحقوق محفوظة</p>
      </footer>
    </div>
  );
}

function SearchField({
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
    <label className="flex items-center gap-3 px-3 sm:px-4 py-2.5 rounded-2xl hover:bg-sand-light transition cursor-text">
      <span className="w-9 h-9 rounded-xl bg-brand-soft text-brand flex items-center justify-center shrink-0">
        {icon}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-[10px] uppercase tracking-[0.2em] text-ink-muted font-semibold">
          {labelEn} · <span dir="rtl">{labelAr}</span>
        </span>
        {children}
      </span>
    </label>
  );
}

function BookingItem({ booking }: { booking: Booking }) {
  const isPending = booking.status === "pending";
  return (
    <Link
      href={`/confirmation/${booking.id}`}
      className="card card-lift block p-5"
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
        <span className="inline-flex items-center gap-1.5 font-semibold text-brand">
          View <ArrowRight className="w-3.5 h-3.5" />
        </span>
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
      <div className="shrink-0 w-11 h-11 rounded-2xl bg-white/15 border border-white/20 backdrop-blur text-white flex items-center justify-center">
        <div className="[&>svg]:w-5 [&>svg]:h-5">{icon}</div>
      </div>
      <div className="min-w-0">
        <h3 className="font-bold text-white">{titleEn}</h3>
        <p className="text-xs text-white/75 mt-0.5" dir="rtl">
          {titleAr}
        </p>
        <p className="mt-1.5 text-sm text-white/80 leading-relaxed">{descEn}</p>
      </div>
    </div>
  );
}

