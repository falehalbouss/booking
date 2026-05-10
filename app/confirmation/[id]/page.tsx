"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle2, Clock3, XCircle } from "lucide-react";
import Header from "@/components/Header";
import { findRoom } from "@/lib/rooms";
import { useBookings } from "@/lib/store";
import type { Booking } from "@/lib/types";

export default function ConfirmationPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const searchParams = useSearchParams();
  const paymentParam = searchParams.get("payment"); // "paid" | "failed" | null
  const paymentIdParam = searchParams.get("paymentId");

  const { getBooking, refreshBooking, applyPaymentResult } = useBookings();
  const [booking, setBooking] = useState<Booking | undefined>(() =>
    getBooking(id)
  );
  const [syncing, setSyncing] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // If we just came back from MyFatoorah, persist the result.
      if (paymentParam === "paid" || paymentParam === "failed") {
        await applyPaymentResult(
          id,
          paymentParam,
          paymentIdParam ?? undefined
        );
      }
      const fresh = await refreshBooking(id);
      if (!cancelled) {
        setBooking(fresh ?? getBooking(id));
        setSyncing(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, paymentParam, paymentIdParam]);

  const room = findRoom(booking?.roomId);

  if (!booking) {
    return (
      <Shell>
        <div className="container-page py-16 text-center">
          <h1 className="display-serif text-3xl font-bold text-ink">
            {syncing ? "Loading booking…" : "Booking not found"}
          </h1>
          <p className="text-base text-ink-muted mt-1" dir="rtl">
            {syncing ? "جاري تحميل الحجز…" : "الحجز غير موجود"}
          </p>
          {!syncing && (
            <Link href="/" className="mt-8 btn-primary inline-flex">
              Back to home · الرئيسية
            </Link>
          )}
        </div>
      </Shell>
    );
  }

  const status = booking.paymentStatus;

  return (
    <Shell>
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
              <PaymentBadge status={status} />
              <h1 className="display-serif mt-3 text-3xl sm:text-4xl font-extrabold text-ink">
                {status === "paid"
                  ? "Your stay is booked"
                  : status === "failed"
                  ? "Payment didn't go through"
                  : "Booking pending payment"}
              </h1>
              <p
                className="display-serif text-2xl text-ink-muted mt-1"
                dir="rtl"
              >
                {status === "paid"
                  ? "تم تأكيد حجزك"
                  : status === "failed"
                  ? "لم تكتمل عملية الدفع"
                  : "الحجز بانتظار الدفع"}
              </p>

              <div className="mt-6 inline-block bg-sand-light border border-sand rounded-2xl px-6 py-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-ink-muted font-semibold">
                  Reference · رقم الحجز
                </p>
                <p className="display-serif mt-1 text-3xl font-bold text-brand tracking-wider">
                  {booking.ref}
                </p>
              </div>

              {status === "failed" && (
                <Link
                  href={`/book?roomId=${booking.roomId}`}
                  className="btn-primary mt-6 inline-flex"
                >
                  Try payment again · أعد المحاولة
                </Link>
              )}
            </div>
          </div>

          <div className="mt-5 card p-6 text-left">
            <h2 className="display-serif text-xl font-bold text-ink">
              Your booking
            </h2>
            <p className="text-xs text-ink-muted" dir="rtl">
              تفاصيل الحجز
            </p>
            <dl className="mt-4 space-y-3 text-sm">
              <Row labelEn="Guest" labelAr="الضيف" value={booking.fullName} />
              <Row labelEn="Phone" labelAr="الجوال" value={booking.phone} />
              <Row
                labelEn="Room"
                labelAr="الغرفة"
                value={`${booking.roomNameEn} · ${booking.roomNameAr}`}
              />
              <Row
                labelEn="Check-in"
                labelAr="تاريخ الوصول"
                value={booking.checkIn}
              />
              <Row
                labelEn="Nights"
                labelAr="عدد الليالي"
                value={String(booking.nights)}
              />
              <Row
                labelEn="Total"
                labelAr="الإجمالي"
                value={`${booking.totalKWD.toLocaleString("en-US")} KWD`}
              />
              {booking.notes && (
                <Row
                  labelEn="Notes"
                  labelAr="ملاحظات"
                  value={booking.notes}
                />
              )}
            </dl>
          </div>

          {status === "paid" && (
            <div className="mt-5 card p-6 bg-accent-soft/50 border-accent/15">
              <span className="eyebrow text-accent-dark">
                Next · ماذا بعد
              </span>
              <h2 className="display-serif mt-1 text-xl font-bold text-ink">
                What happens next
              </h2>
              <ul className="mt-4 space-y-2.5 text-sm text-ink-muted">
                <li className="flex gap-2">
                  <span className="text-accent">·</span>
                  <span>
                    We will call you on {booking.phone} to confirm your check-in.
                  </span>
                </li>
                <li className="flex gap-2" dir="rtl">
                  <span className="text-accent">·</span>
                  <span>سنتصل بك على {booking.phone} لتأكيد الوصول.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">·</span>
                  <span>
                    Keep reference {booking.ref} for any questions.
                  </span>
                </li>
              </ul>
            </div>
          )}

          <Link href="/" className="mt-6 btn-primary w-full">
            Back to home · العودة للرئيسية
          </Link>
        </div>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
    </div>
  );
}

function PaymentBadge({ status }: { status: Booking["paymentStatus"] }) {
  if (status === "paid") {
    return (
      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-soft text-accent-dark text-xs font-bold">
        <CheckCircle2 className="w-4 h-4" />
        Paid · مدفوع
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-soft text-brand-ink text-xs font-bold">
        <XCircle className="w-4 h-4" />
        Failed · فشل الدفع
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sand text-ink text-xs font-bold">
      <Clock3 className="w-4 h-4" />
      Pending · قيد الانتظار
    </span>
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
        <dt className="text-xs text-ink-muted" dir="rtl">
          {labelAr}
        </dt>
      </div>
      <dd className="text-sm font-medium text-ink text-right">{value}</dd>
    </div>
  );
}
