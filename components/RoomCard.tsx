import Link from "next/link";
import type { Room } from "@/lib/types";

const roomVisual: Record<string, { gradient: string; emoji: string }> = {
  single: { gradient: "from-sky-400 to-indigo-500", emoji: "🛏" },
  double: { gradient: "from-rose-400 to-pink-500", emoji: "🛏🛏" },
  suite: { gradient: "from-amber-400 to-orange-500", emoji: "✨" },
  family: { gradient: "from-emerald-400 to-teal-500", emoji: "👨‍👩‍👧" },
};

export default function RoomCard({ room }: { room: Room }) {
  const visual = roomVisual[room.id] ?? { gradient: "from-slate-400 to-slate-600", emoji: "🏨" };

  return (
    <article className="card card-hover overflow-hidden">
      <div className={`relative h-28 bg-gradient-to-br ${visual.gradient} flex items-center justify-center`}>
        <span className="text-3xl drop-shadow-sm">{visual.emoji}</span>
        <span className="absolute top-2.5 right-2.5 text-[10px] uppercase tracking-wider font-semibold bg-white/95 text-slate-900 px-2 py-1 rounded-full">
          {room.capacity} {room.capacity === 1 ? "guest" : "guests"}
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-slate-900">{room.nameEn}</h3>
            <p className="text-sm text-slate-500" dir="rtl">{room.nameAr}</p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-xl font-bold text-brand leading-none">{room.priceSAR}</div>
            <div className="text-[10px] text-slate-500 mt-1">SAR / night</div>
            <div className="text-[10px] text-slate-500" dir="rtl">ريال / ليلة</div>
          </div>
        </div>

        <p className="mt-3 text-sm text-slate-600">{room.descEn}</p>
        <p className="text-sm text-slate-600" dir="rtl">{room.descAr}</p>

        <Link
          href={{ pathname: "/book", query: { roomId: room.id } }}
          className="mt-4 block w-full text-center bg-brand text-white font-medium py-2.5 rounded-xl hover:bg-brand-dark active:scale-[0.99] transition"
        >
          Book this room · احجز
        </Link>
      </div>
    </article>
  );
}
