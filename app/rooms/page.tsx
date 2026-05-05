import Link from "next/link";
import Header from "@/components/Header";
import RoomCard from "@/components/RoomCard";
import { rooms } from "@/lib/rooms";

export default function RoomsPage() {
  return (
    <div className="min-h-dvh flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="max-w-md mx-auto px-5 py-6">
          <Link
            href="/"
            className="text-xs text-slate-500 hover:text-slate-700 inline-flex items-center gap-1"
          >
            ← Home · الرئيسية
          </Link>

          <h1 className="mt-3 text-2xl font-bold text-slate-900 tracking-tight">
            Choose a room
          </h1>
          <p className="text-sm text-slate-500" dir="rtl">اختر غرفتك</p>
          <p className="mt-2 text-sm text-slate-600">
            Pick the room that fits your stay, then continue to booking.
          </p>
          <p className="text-sm text-slate-600" dir="rtl">
            اختر الغرفة المناسبة لإقامتك ثم تابع للحجز.
          </p>

          <div className="mt-6 space-y-4">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
