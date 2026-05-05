"use client";

import Link from "next/link";
import Header from "@/components/Header";
import { useBookings } from "@/lib/store";

export default function ConfirmationPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const { getBooking } = useBookings();
  const booking = getBooking(id);

  if (!booking) {
    return (
      <div className="min-h-dvh flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="max-w-md mx-auto px-5 py-10 text-center">
            <h1 className="text-xl font-bold text-slate-900">Booking not found</h1>
            <p className="text-sm text-slate-500" dir="rtl">الحجز غير موجود</p>
            <p className="mt-3 text-sm text-slate-600">
              The booking might have been cleared. Please book again.
            </p>
            <p className="text-sm text-slate-600" dir="rtl">
              ربما تم مسح الحجز. الرجاء الحجز مرة أخرى.
            </p>
            <Link href="/" className="mt-6 inline-block btn-primary">
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
        <div className="max-w-md mx-auto px-5 py-6">
          <div className="card p-6 text-center bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/30">
              ✓
            </div>
            <h1 className="mt-4 text-xl font-bold text-emerald-900 tracking-tight">
              Booking confirmed
            </h1>
            <p className="text-sm text-emerald-700" dir="rtl">تم تأكيد الحجز</p>

            <div className="mt-4 inline-block bg-white border border-emerald-200 rounded-xl px-5 py-3">
              <p className="text-[10px] uppercase tracking-wider text-emerald-700 font-semibold">
                Reference · رقم الحجز
              </p>
              <p className="mt-1 text-2xl font-mono font-bold text-emerald-900 tracking-wider">
                {booking.ref}
              </p>
            </div>
          </div>

          <div className="mt-5 card p-5">
            <h2 className="text-sm font-semibold text-slate-900">
              Your booking
            </h2>
            <p className="text-xs text-slate-500" dir="rtl">تفاصيل الحجز</p>
            <dl className="mt-3 space-y-3 text-sm">
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

          <div className="mt-5 card p-5 bg-brand-soft border-brand/15">
            <h2 className="text-sm font-semibold text-brand">What happens next?</h2>
            <p className="text-xs text-brand/70" dir="rtl">ماذا بعد؟</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li className="flex gap-2">
                <span className="text-brand">•</span>
                <span>We will call you on {booking.phone} to confirm.</span>
              </li>
              <li className="flex gap-2" dir="rtl">
                <span className="text-brand">•</span>
                <span>سنتصل بك على {booking.phone} للتأكيد.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-brand">•</span>
                <span>Please save your reference number {booking.ref}.</span>
              </li>
              <li className="flex gap-2" dir="rtl">
                <span className="text-brand">•</span>
                <span>احفظ رقم الحجز {booking.ref}.</span>
              </li>
            </ul>
          </div>

          <Link href="/" className="mt-6 btn-primary w-full">
            Back to home · العودة للرئيسية
          </Link>
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
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
      <div>
        <dt className="text-xs text-slate-500">{labelEn}</dt>
        <dt className="text-xs text-slate-500" dir="rtl">{labelAr}</dt>
      </div>
      <dd className="text-sm font-medium text-slate-900 text-right">{value}</dd>
    </div>
  );
}
