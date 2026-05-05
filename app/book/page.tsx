"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
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
  const { user } = useAuth();

  const today = new Date().toISOString().slice(0, 10);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.name && !fullName) {
      setFullName(user.name);
    }
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
            <p className="mt-4 text-sm text-ink-muted">
              Please pick a room from the list.
            </p>
            <p className="text-sm text-ink-muted" dir="rtl">
              من فضلك اختر غرفة من القائمة.
            </p>
            <Link href="/rooms" className="mt-8 btn-primary">
              Back to rooms · العودة للغرف
            </Link>
          </div>
        </main>
      </div>
    );
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!fullName.trim() || !phone.trim() || !checkIn) {
      setError("Please fill in all required fields. الرجاء تعبئة الحقول المطلوبة.");
      return;
    }
    const booking = addBooking({
      roomId: room!.id,
      fullName,
      phone,
      checkIn,
      notes,
    });
    if (!booking) {
      setError("Could not create booking. تعذّر إنشاء الحجز.");
      return;
    }
    router.push(`/confirmation/${booking.id}`);
  }

  return (
    <div className="min-h-dvh flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container-page py-8 lg:py-12">
          <Link
            href="/rooms"
            className="text-xs text-ink-muted hover:text-ink inline-flex items-center gap-1"
          >
            ← Back to rooms · العودة للغرف
          </Link>

          <div className="mt-4 grid lg:grid-cols-12 gap-8 lg:gap-10">
            <aside className="lg:col-span-5 lg:sticky lg:top-24 self-start">
              <div className="card overflow-hidden">
                <div className="relative aspect-[4/3]">
                  <Image
                    src={room.imageUrl}
                    alt={room.nameEn}
                    fill
                    sizes="(min-width: 1024px) 420px, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-5">
                  <span className="eyebrow text-brand">Selected · المختارة</span>
                  <h2 className="display-serif mt-1 text-2xl font-bold text-ink">
                    {room.nameEn}
                  </h2>
                  <p className="text-sm text-ink-muted" dir="rtl">{room.nameAr}</p>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="display-serif text-3xl font-bold text-brand">
                      {room.priceSAR}
                    </span>
                    <span className="text-xs text-ink-muted">SAR / night · ريال / ليلة</span>
                  </div>
                  <p className="mt-4 text-sm text-ink-muted leading-relaxed">
                    {room.descEn}
                  </p>
                  <p className="text-sm text-ink-muted leading-relaxed" dir="rtl">
                    {room.descAr}
                  </p>
                </div>
              </div>
            </aside>

            <section className="lg:col-span-7">
              <span className="eyebrow text-accent">Details · التفاصيل</span>
              <h1 className="display-serif mt-1 text-4xl font-extrabold text-ink">
                Booking details
              </h1>
              <p className="text-lg text-ink-muted" dir="rtl">تفاصيل الحجز</p>

              <form onSubmit={onSubmit} className="mt-6 card p-6 space-y-5">
                <Field labelEn="Full name" labelAr="الاسم الكامل" required>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="input-base"
                    placeholder="Mohammed Al-Saleh"
                  />
                </Field>

                <Field labelEn="Phone number" labelAr="رقم الجوال" required>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="input-base"
                    placeholder="05xxxxxxxx"
                  />
                </Field>

                <Field labelEn="Check-in date" labelAr="تاريخ الوصول" required>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    min={today}
                    required
                    className="input-base"
                  />
                </Field>

                <Field labelEn="Notes (optional)" labelAr="ملاحظات (اختياري)">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="input-base resize-none"
                    placeholder="Late arrival, extra pillows, etc."
                  />
                </Field>

                {error && (
                  <p className="text-sm text-brand-dark bg-brand-soft border border-brand/30 rounded-xl p-3">
                    {error}
                  </p>
                )}

                <button type="submit" className="btn-primary w-full">
                  Confirm booking · تأكيد الحجز
                </button>
              </form>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function Field({
  labelEn,
  labelAr,
  required,
  children,
}: {
  labelEn: string;
  labelAr: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink">
        {labelEn}
        {required && <span className="text-brand"> *</span>}
      </span>
      <span className="block text-xs text-ink-muted mb-1.5" dir="rtl">{labelAr}</span>
      {children}
    </label>
  );
}
