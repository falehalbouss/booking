"use client";

import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import { findRoom } from "@/lib/rooms";
import { useBookings } from "@/lib/store";

export default function ConfirmationPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const { getBooking } = useBookings();
  const booking = getBooking(id);
  const room = findRoom(booking?.roomId);

  if (!booking) {
    return (
      <div className="min-h-dvh flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="container-page py-16 text-center">
            <h1 className="display-serif text-3xl font-bold text-ink">
              Booking not found
            </h1>
            <p className="text-base text-ink-muted mt-1" dir="rtl">
              الحجز غير موجود
            </p>
            <p className="mt-4 text-sm text-ink-muted">
              The booking might have been cleared. Please book again.
            </p>
            <p className="text-sm text-ink-muted" dir="rtl">
              ربما تم مسح الحجز. الرجاء الحجز مرة أخرى.
            </p>
            <Link href="/" className="mt-8 btn-primary">
              Back to home · الرئيسية
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container-page py-8 lg:py-12">
          <div className="max-w-2xl mx-auto">
            <div className="card overflow-hidden">
              {room && (
                <div className="relative aspect-[16/9] sm:aspect-[16/7]">
                  <Image
                    src={room.imageUrl}
                    alt={room.nameEn}
                    fill
                    priority
                    sizes="(min-width: 1024px) 700px, 100vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent" />
                </div>
              )}

              <div className="p-6 sm:p-8 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center text-xl">
                  ✓
                </div>
                <span className="eyebrow text-accent mt-4">
                  Confirmed · تم التأكيد
                </span>
                <h1 className="display-serif mt-2 text-3xl sm:text-4xl font-extrabold text-ink">
                  Your stay is booked
                </h1>
                <p className="display-serif text-2xl text-ink-muted mt-1" dir="rtl">
                  تم تأكيد حجزك
                </p>

                <div className="mt-6 inline-block bg-sand-light border border-sand rounded-2xl px-6 py-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-ink-muted font-semibold">
                    Reference · رقم الحجز
                  </p>
                  <p className="display-serif mt-1 text-3xl font-bold text-brand tracking-wider">
                    {booking.ref}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 card p-6 text-left">
              <h2 className="display-serif text-xl font-bold text-ink">
                Your booking
              </h2>
              <p className="text-xs text-ink-muted" dir="rtl">تفاصيل الحجز</p>
              <dl className="mt-4 space-y-3 text-sm">
                <Row labelEn="Guest" labelAr="الضيف" value={booking.fullName} />
                <Row labelEn="Phone" labelAr="الجوال" value={booking.phone} />
                <Row
                  labelEn="Room"
                  labelAr="الغرفة"
                  value={`${booking.roomNameEn} · ${booking.roomNameAr}`}
                />
                <Row labelEn="Check-in" labelAr="تاريخ الوصول" value={booking.checkIn} />
                {booking.notes && (
                  <Row labelEn="Notes" labelAr="ملاحظات" value={booking.notes} />
                )}
              </dl>
            </div>

            <div className="mt-5 card p-6 bg-accent-soft/50 border-accent/15">
              <span className="eyebrow text-accent-dark">Next · ماذا بعد</span>
              <h2 className="display-serif mt-1 text-xl font-bold text-ink">
                What happens next
              </h2>
              <ul className="mt-4 space-y-2.5 text-sm text-ink-muted">
                <li className="flex gap-2">
                  <span className="text-accent">·</span>
                  <span>We will call you on {booking.phone} to confirm.</span>
                </li>
                <li className="flex gap-2" dir="rtl">
                  <span className="text-accent">·</span>
                  <span>سنتصل بك على {booking.phone} للتأكيد.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">·</span>
                  <span>Save your reference number {booking.ref}.</span>
                </li>
                <li className="flex gap-2" dir="rtl">
                  <span className="text-accent">·</span>
                  <span>احفظ رقم الحجز {booking.ref}.</span>
                </li>
              </ul>
            </div>

            <Link href="/" className="mt-6 btn-primary w-full">
              Back to home · العودة للرئيسية
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function Row({
  labelEn,
  labelAr,
  value,
}: {
  labelEn: string;
  labelAr: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-sand pb-3 last:border-0 last:pb-0">
      <div>
        <dt className="text-xs text-ink-muted">{labelEn}</dt>
        <dt className="text-xs text-ink-muted" dir="rtl">{labelAr}</dt>
      </div>
      <dd className="text-sm font-medium text-ink text-right">{value}</dd>
    </div>
  );
}
