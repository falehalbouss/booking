"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Bath,
  BedDouble,
  CalendarCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Phone,
  Ruler,
  Star,
  StickyNote,
  User,
  Users,
} from "lucide-react";
import Header from "@/components/Header";
import { findRoom } from "@/lib/rooms";
import { useAuth, useBookings } from "@/lib/store";

export default function BookPage() {
  return (
    <Suspense fallback={null}>
      <BookForm />
    </Suspense>
  );
}

function BookForm() {
  const router = useRouter();
  const params = useSearchParams();
  const roomId = params.get("roomId");
  const room = useMemo(() => findRoom(roomId), [roomId]);
  const { addBooking } = useBookings();
  const { user, isSignedIn, loading: authLoading } = useAuth();

  const today = new Date().toISOString().slice(0, 10);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (authLoading) return;
    if (!isSignedIn) {
      const next = roomId ? `/book?roomId=${roomId}` : "/book";
      router.replace(`/signin?next=${encodeURIComponent(next)}`);
    }
  }, [authLoading, isSignedIn, roomId, router]);

  useEffect(() => {
    if (user?.name && !fullName) setFullName(user.name);
  }, [user, fullName]);

  if (!room) {
    return (
      <div className="min-h-dvh flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="container-page py-16 text-center">
            <h1 className="display-serif text-3xl font-bold text-ink">
              Room not found
            </h1>
            <p className="text-base text-ink-muted mt-1" dir="rtl">
              الغرفة غير موجودة
            </p>
            <Link href="/rooms" className="btn-primary mt-8">
              Back to rooms · العودة للغرف
            </Link>
          </div>
        </main>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!user) {
      setError("Please sign in. الرجاء تسجيل الدخول.");
      return;
    }
    if (!fullName.trim() || !phone.trim() || !checkIn) {
      setError("Please fill in all required fields. الرجاء تعبئة الحقول المطلوبة.");
      return;
    }
    setSubmitting(true);
    const booking = await addBooking({
      roomId: room!.id,
      fullName,
      phone,
      checkIn,
      notes,
    });
    setSubmitting(false);
    if (!booking) {
      setError("Could not create booking. تعذّر إنشاء الحجز.");
      return;
    }
    router.push(`/confirmation/${booking.id}`);
  }

  const gallery = room.gallery.length ? room.gallery : [room.imageUrl];
  const next = () => setActiveImage((i) => (i + 1) % gallery.length);
  const prev = () => setActiveImage((i) => (i - 1 + gallery.length) % gallery.length);

  return (
    <div className="min-h-dvh flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container-page pt-6 pb-16">
          <Link
            href="/rooms"
            className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to rooms · العودة للغرف
          </Link>

          <div className="mt-4 grid lg:grid-cols-12 gap-8 lg:gap-10">
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-5 lg:sticky lg:top-24 self-start space-y-4"
            >
              <div className="card overflow-hidden">
                <div className="relative aspect-[4/3] bg-sand group img-zoom-trigger">
                  <Image
                    key={gallery[activeImage]}
                    src={gallery[activeImage]}
                    alt={room.nameEn}
                    fill
                    sizes="(min-width: 1024px) 480px, 100vw"
                    className="object-cover img-zoom"
                    priority
                  />
                  <div className="absolute inset-x-0 top-0 p-3 flex items-center justify-between">
                    <span className="pill bg-white/95 text-ink shadow-soft">
                      <Star className="w-3.5 h-3.5 fill-accent text-accent" />
                      {room.rating.toFixed(1)} ({room.reviews})
                    </span>
                    <span className="pill bg-white/95 text-ink">
                      <Ruler className="w-3.5 h-3.5" />
                      {room.sizeSqm} m²
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={prev}
                    aria-label="Previous"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/95 hover:bg-white text-ink shadow-soft flex items-center justify-center"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    aria-label="Next"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/95 hover:bg-white text-ink shadow-soft flex items-center justify-center"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5">
                    {gallery.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setActiveImage(i)}
                        className={`h-1.5 rounded-full transition-all ${
                          i === activeImage ? "w-6 bg-white" : "w-1.5 bg-white/60"
                        }`}
                        aria-label={`Image ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="p-5">
                  <span className="eyebrow text-brand">Selected · المختارة</span>
                  <div className="flex items-start justify-between gap-3 mt-2">
                    <div>
                      <h2 className="display-serif text-2xl font-bold text-ink leading-tight">
                        {room.nameEn}
                      </h2>
                      <p className="text-sm text-ink-muted mt-0.5" dir="rtl">
                        {room.nameAr}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="display-serif text-3xl font-bold text-brand leading-none">
                        {room.priceSAR}
                      </div>
                      <div className="text-[10px] tracking-wider uppercase text-ink-muted mt-1">
                        SAR / night
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    <span className="icon-chip">
                      <BedDouble className="w-3.5 h-3.5" /> {room.beds} bed
                    </span>
                    <span className="icon-chip">
                      <Bath className="w-3.5 h-3.5" /> {room.baths} bath
                    </span>
                    <span className="icon-chip">
                      <Users className="w-3.5 h-3.5" /> {room.capacity} guests
                    </span>
                  </div>

                  <p className="mt-4 text-sm text-ink-muted leading-relaxed">
                    {room.descEn}
                  </p>
                  <p
                    className="text-sm text-ink-muted leading-relaxed"
                    dir="rtl"
                  >
                    {room.descAr}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-2">
                    {room.amenitiesEn.map((a, i) => (
                      <div
                        key={a}
                        className="flex items-center gap-1.5 text-xs text-ink-muted"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand" />
                        <span>
                          {a} ·{" "}
                          <span dir="rtl" className="text-ink-muted">
                            {room.amenitiesAr[i]}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-brand text-white flex items-center justify-center font-bold">
                  L
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-ink-muted uppercase tracking-[0.2em] font-semibold">
                    Concierge · الاستقبال
                  </p>
                  <p className="font-bold text-ink truncate">
                    Layali Front Desk
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <a
                    href="tel:+9660000000"
                    className="btn-icon"
                    title="Call"
                    aria-label="Call"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                  <a
                    href="https://wa.me/9660000000"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-icon"
                    title="Message"
                    aria-label="Message"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </motion.aside>

            <motion.section
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-7"
            >
              <span className="eyebrow text-brand">
                <span className="w-6 h-px bg-brand" /> Details · التفاصيل
              </span>
              <h1 className="display-serif mt-3 text-4xl sm:text-5xl font-extrabold text-ink leading-[1.05]">
                Booking details
              </h1>
              <p
                className="display-serif text-2xl sm:text-3xl text-ink-muted mt-1"
                dir="rtl"
              >
                تفاصيل الحجز
              </p>

              <form onSubmit={onSubmit} className="mt-6 card p-6 space-y-5">
                <Field
                  icon={<User className="w-4 h-4" />}
                  labelEn="Full name"
                  labelAr="الاسم الكامل"
                  required
                >
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="input-base"
                    placeholder="Mohammed Al-Saleh"
                  />
                </Field>

                <Field
                  icon={<Phone className="w-4 h-4" />}
                  labelEn="Phone number"
                  labelAr="رقم الجوال"
                  required
                >
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="input-base"
                    placeholder="05xxxxxxxx"
                  />
                </Field>

                <Field
                  icon={<CalendarCheck className="w-4 h-4" />}
                  labelEn="Check-in date"
                  labelAr="تاريخ الوصول"
                  required
                >
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    min={today}
                    required
                    className="input-base"
                  />
                </Field>

                <Field
                  icon={<StickyNote className="w-4 h-4" />}
                  labelEn="Notes (optional)"
                  labelAr="ملاحظات (اختياري)"
                >
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="input-base resize-none"
                    placeholder="Late arrival, extra pillows, etc."
                  />
                </Field>

                {error && (
                  <p className="text-sm text-brand-dark bg-brand-soft border border-brand/20 rounded-2xl p-3">
                    {error}
                  </p>
                )}

                <div className="flex items-center justify-between gap-4 pt-2">
                  <div className="text-sm text-ink-muted">
                    Total ·{" "}
                    <span className="display-serif font-bold text-2xl text-ink">
                      {room.priceSAR}
                    </span>{" "}
                    <span className="text-xs">SAR / night</span>
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary group disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Saving…" : "Confirm · تأكيد"}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </form>
            </motion.section>
          </div>
        </div>
      </main>
    </div>
  );
}

function Field({
  icon,
  labelEn,
  labelAr,
  required,
  children,
}: {
  icon: React.ReactNode;
  labelEn: string;
  labelAr: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-center gap-2 text-sm font-semibold text-ink">
        <span className="w-7 h-7 rounded-lg bg-brand-soft text-brand flex items-center justify-center">
          {icon}
        </span>
        {labelEn}
        {required && <span className="text-brand">*</span>}
        <span className="ml-1.5 text-xs text-ink-muted font-medium" dir="rtl">
          · {labelAr}
        </span>
      </span>
      <div className="mt-2">{children}</div>
    </label>
  );
}
