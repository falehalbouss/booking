"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { useAdmin, useAuth } from "@/lib/store";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";
import type { Booking, BookingStatus } from "@/lib/types";

type BookingRow = Database["public"]["Tables"]["bookings"]["Row"];

function rowToBooking(row: BookingRow): Booking {
  return {
    id: row.id,
    ref: row.ref,
    roomId: row.room_id,
    roomNameEn: row.room_name_en,
    roomNameAr: row.room_name_ar,
    fullName: row.full_name,
    phone: row.phone,
    checkIn: row.check_in,
    nights: row.nights ?? 1,
    totalKWD: Number(row.total_kwd ?? 0),
    paymentStatus:
      row.payment_status === "paid"
        ? "paid"
        : row.payment_status === "failed"
        ? "failed"
        : "pending",
    paymentId: row.payment_id ?? undefined,
    notes: row.notes ?? undefined,
    status: row.status === "pending" ? "pending" : "done",
    createdAt: row.created_at,
  };
}

type Tab = "bookings" | "users";

type AdminProfileRow = {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
};

export default function AdminPage() {
  const router = useRouter();
  const { isSignedIn, loading } = useAuth();
  const {
    isAdmin,
    fetchAllBookings,
    fetchAllProfiles,
    updateBookingStatus,
    deleteBooking,
  } = useAdmin();

  const [tab, setTab] = useState<Tab>("bookings");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [profiles, setProfiles] = useState<AdminProfileRow[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [liveStatus, setLiveStatus] = useState<"connecting" | "live" | "offline">(
    "connecting"
  );

  useEffect(() => {
    if (loading) return;
    if (!isSignedIn) {
      router.replace("/signin");
      return;
    }
    if (!isAdmin) return;

    let cancelled = false;
    (async () => {
      setDataLoading(true);
      const [b, p] = await Promise.all([
        fetchAllBookings(),
        fetchAllProfiles(),
      ]);
      if (cancelled) return;
      setBookings(b);
      setProfiles(p);
      setDataLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [
    loading,
    isSignedIn,
    isAdmin,
    router,
    fetchAllBookings,
    fetchAllProfiles,
  ]);

  // Realtime subscription: keep the bookings list in sync with the DB.
  useEffect(() => {
    if (!isAdmin) return;
    const supabase = getSupabaseBrowserClient();
    setLiveStatus("connecting");
    const channel = supabase
      .channel("admin-bookings")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "bookings" },
        (payload) => {
          const incoming = rowToBooking(payload.new as BookingRow);
          setBookings((prev) =>
            prev.some((b) => b.id === incoming.id) ? prev : [incoming, ...prev]
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "bookings" },
        (payload) => {
          const updated = rowToBooking(payload.new as BookingRow);
          setBookings((prev) =>
            prev.map((b) => (b.id === updated.id ? updated : b))
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "bookings" },
        (payload) => {
          const removedId = (payload.old as Partial<BookingRow>).id;
          if (!removedId) return;
          setBookings((prev) => prev.filter((b) => b.id !== removedId));
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") setLiveStatus("live");
        else if (status === "CLOSED" || status === "CHANNEL_ERROR")
          setLiveStatus("offline");
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  if (loading) {
    return (
      <Shell>
        <p className="text-sm text-ink-muted">Loading… · جاري التحميل…</p>
      </Shell>
    );
  }

  if (!isAdmin) {
    return (
      <Shell>
        <div className="card p-8 text-center">
          <h1 className="display-serif text-2xl font-bold text-ink">
            Access denied
          </h1>
          <p className="text-base text-ink-muted mt-1" dir="rtl">
            ليس لديك صلاحية الوصول
          </p>
          <p className="mt-4 text-sm text-ink-muted">
            This page is for administrators only.
          </p>
          <p className="text-sm text-ink-muted" dir="rtl">
            هذه الصفحة للمشرفين فقط.
          </p>
          <Link href="/" className="btn-primary mt-6 inline-flex">
            Back home · العودة للرئيسية
          </Link>
        </div>
      </Shell>
    );
  }

  async function onChangeStatus(id: string, status: BookingStatus) {
    setBusyId(id);
    const { error } = await updateBookingStatus(id, status);
    setBusyId(null);
    if (error) {
      alert(`Failed: ${error}`);
      return;
    }
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status } : b))
    );
  }

  async function onDelete(id: string, ref: string) {
    if (
      !confirm(
        `Delete booking ${ref}? · حذف الحجز ${ref}؟\nThis cannot be undone.`
      )
    ) {
      return;
    }
    setBusyId(id);
    const { error } = await deleteBooking(id);
    setBusyId(null);
    if (error) {
      alert(`Failed: ${error}`);
      return;
    }
    setBookings((prev) => prev.filter((b) => b.id !== id));
  }

  return (
    <Shell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow text-brand">Admin · لوحة المشرف</span>
          <h1 className="display-serif mt-1 text-4xl sm:text-5xl font-extrabold text-ink leading-[1.05]">
            Admin dashboard
          </h1>
          <p className="display-serif text-2xl text-ink-muted mt-1" dir="rtl">
            لوحة المشرف
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-ink-muted">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${
              liveStatus === "live"
                ? "bg-brand-soft text-brand-ink border-brand/20"
                : liveStatus === "connecting"
                ? "bg-sand-light text-ink-muted border-black/5"
                : "bg-accent-soft text-accent-dark border-accent/20"
            }`}
            title="Realtime status"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                liveStatus === "live"
                  ? "bg-brand animate-pulse"
                  : liveStatus === "connecting"
                  ? "bg-ink-muted"
                  : "bg-accent"
              }`}
            />
            {liveStatus === "live"
              ? "Live · مباشر"
              : liveStatus === "connecting"
              ? "Connecting…"
              : "Offline"}
          </span>
          <span>
            {bookings.length} bookings · {profiles.length} users
          </span>
        </div>
      </div>

      <div className="mt-6 inline-flex p-1 rounded-xl bg-sand-light border border-sand">
        <TabButton active={tab === "bookings"} onClick={() => setTab("bookings")}>
          Bookings · الحجوزات
        </TabButton>
        <TabButton active={tab === "users"} onClick={() => setTab("users")}>
          Users · المستخدمون
        </TabButton>
      </div>

      <div className="mt-6">
        {dataLoading ? (
          <p className="text-sm text-ink-muted">Loading… · جاري التحميل…</p>
        ) : tab === "bookings" ? (
          <BookingsTable
            bookings={bookings}
            busyId={busyId}
            onChangeStatus={onChangeStatus}
            onDelete={onDelete}
          />
        ) : (
          <UsersTable profiles={profiles} />
        )}
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container-page py-8 lg:py-12">{children}</div>
      </main>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
        active
          ? "bg-white text-ink shadow-sm"
          : "text-ink-muted hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function BookingsTable({
  bookings,
  busyId,
  onChangeStatus,
  onDelete,
}: {
  bookings: Booking[];
  busyId: string | null;
  onChangeStatus: (id: string, status: BookingStatus) => void;
  onDelete: (id: string, ref: string) => void;
}) {
  if (bookings.length === 0) {
    return (
      <div className="card p-8 text-center text-sm text-ink-muted">
        No bookings yet · لا توجد حجوزات بعد
      </div>
    );
  }
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-sand-light text-ink-muted text-xs uppercase tracking-wider">
            <tr>
              <Th>Ref · المرجع</Th>
              <Th>Guest · الضيف</Th>
              <Th>Phone · الجوال</Th>
              <Th>Room · الغرفة</Th>
              <Th>Check-in · الوصول</Th>
              <Th>Status · الحالة</Th>
              <Th>Actions · إجراءات</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sand">
            {bookings.map((b) => (
              <tr key={b.id} className="hover:bg-sand-light/40">
                <Td>
                  <span className="font-mono font-semibold text-ink">{b.ref}</span>
                </Td>
                <Td>
                  <div className="font-medium text-ink">{b.fullName}</div>
                  {b.notes && (
                    <div
                      className="text-xs text-ink-muted truncate max-w-[12rem]"
                      title={b.notes}
                    >
                      {b.notes}
                    </div>
                  )}
                </Td>
                <Td>
                  <span dir="ltr" className="font-mono text-ink-muted">
                    {b.phone}
                  </span>
                </Td>
                <Td>
                  <div className="text-ink">{b.roomNameEn}</div>
                  <div className="text-xs text-ink-muted" dir="rtl">
                    {b.roomNameAr}
                  </div>
                </Td>
                <Td>{b.checkIn}</Td>
                <Td>
                  <StatusBadge status={b.status} />
                </Td>
                <Td>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={busyId === b.id}
                      onClick={() =>
                        onChangeStatus(
                          b.id,
                          b.status === "done" ? "pending" : "done"
                        )
                      }
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-sand-light text-ink hover:bg-sand transition disabled:opacity-50"
                    >
                      {b.status === "done" ? "Mark pending" : "Mark done"}
                    </button>
                    <button
                      type="button"
                      disabled={busyId === b.id}
                      onClick={() => onDelete(b.id, b.ref)}
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-brand/10 text-brand-dark hover:bg-brand/20 transition disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UsersTable({ profiles }: { profiles: AdminProfileRow[] }) {
  if (profiles.length === 0) {
    return (
      <div className="card p-8 text-center text-sm text-ink-muted">
        No users yet · لا يوجد مستخدمون
      </div>
    );
  }
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-sand-light text-ink-muted text-xs uppercase tracking-wider">
            <tr>
              <Th>Name · الاسم</Th>
              <Th>Email · الإيميل</Th>
              <Th>Joined · تاريخ التسجيل</Th>
              <Th>Role · الدور</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sand">
            {profiles.map((p) => (
              <tr key={p.id} className="hover:bg-sand-light/40">
                <Td>
                  <span className="font-medium text-ink">{p.name}</span>
                </Td>
                <Td>
                  <span className="text-ink-muted">{p.email}</span>
                </Td>
                <Td>{p.createdAt.slice(0, 10)}</Td>
                <Td>
                  {p.isAdmin ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent-soft text-accent-dark text-xs font-semibold">
                      Admin · مشرف
                    </span>
                  ) : (
                    <span className="text-xs text-ink-muted">Guest · ضيف</span>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: BookingStatus }) {
  if (status === "done") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent-soft text-accent-dark text-xs font-semibold">
        Done · مؤكد
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-soft text-brand-dark text-xs font-semibold">
      Pending · قيد المراجعة
    </span>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left px-4 py-3 font-medium">{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 align-top">{children}</td>;
}
