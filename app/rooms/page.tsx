import Link from "next/link";
import Header from "@/components/Header";
import RoomCard from "@/components/RoomCard";
import { rooms } from "@/lib/rooms";

export default function RoomsPage() {
  return (
    <div className="min-h-dvh flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container-page py-8 lg:py-12">
          <Link
            href="/"
            className="text-xs text-ink-muted hover:text-ink inline-flex items-center gap-1"
          >
            ← Home · الرئيسية
          </Link>

          <div className="mt-4 max-w-2xl">
            <span className="eyebrow text-brand">Stay · غرفنا</span>
            <h1 className="display-serif mt-1 text-4xl sm:text-5xl font-extrabold text-ink leading-[1.05]">
              Our rooms
            </h1>
            <p className="display-serif text-2xl text-ink-muted mt-1" dir="rtl">
              غرفنا
            </p>
            <p className="mt-4 text-base text-ink-muted leading-relaxed">
              Pick the room that fits your stay, then continue to booking.
            </p>
            <p className="text-base text-ink-muted leading-relaxed" dir="rtl">
              اختر الغرفة المناسبة لإقامتك ثم تابع للحجز.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
