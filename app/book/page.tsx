"use client";

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
          <div className="max-w-md mx-auto px-5 py-10 text-center">
            <h1 className="text-xl font-bold text-slate-900">Room not found</h1>
            <p className="text-sm text-slate-500" dir="rtl">الغرفة غير موجودة</p>
            <p className="mt-3 text-sm text-slate-600">
              Please pick a room from the list.
            </p>
            <p className="text-sm text-slate-600" dir="rtl">
              من فضلك اختر غرفة من القائمة.
            </p>
            <Link href="/rooms" className="mt-6 inline-block btn-primary">
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
        <div className="max-w-md mx-auto px-5 py-6">
          <Link
            href="/rooms"
            className="text-xs text-slate-500 hover:text-slate-700 inline-flex items-center gap-1"
          >
            ← Back to rooms · العودة للغرف
          </Link>

          <h1 className="mt-3 text-2xl font-bold text-slate-900 tracking-tight">
            Booking details
          </h1>
          <p className="text-sm text-slate-500" dir="rtl">تفاصيل الحجز</p>

          <div className="mt-4 card p-4 bg-gradient-to-br from-brand-soft to-white border-brand/15">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-wider text-brand/70 font-semibold">
                  Selected · المختارة
                </div>
                <div className="mt-1 text-base font-semibold text-slate-900">
                  {room.nameEn}
                </div>
                <div className="text-sm text-slate-600" dir="rtl">{room.nameAr}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-2xl font-bold text-brand leading-none">
                  {room.priceSAR}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">SAR / night</div>
                <div className="text-[10px] text-slate-500" dir="rtl">ريال / ليلة</div>
              </div>
            </div>
          </div>

          <form onSubmit={onSubmit} className="mt-6 card p-5 space-y-4">
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
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
                {error}
              </p>
            )}

            <button type="submit" className="btn-primary w-full">
              Confirm booking · تأكيد الحجز
            </button>
          </form>
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
      <span className="text-sm font-medium text-slate-800">
        {labelEn}
        {required && <span className="text-red-500"> *</span>}
      </span>
      <span className="block text-xs text-slate-500 mb-1.5" dir="rtl">{labelAr}</span>
      {children}
    </label>
  );
}
