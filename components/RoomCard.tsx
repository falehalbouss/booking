import Image from "next/image";
import Link from "next/link";
import type { Room } from "@/lib/types";

export default function RoomCard({ room }: { room: Room }) {
  return (
    <article className="card card-hover overflow-hidden flex flex-col h-full">
      <div className="relative aspect-[4/3] bg-sand">
        <Image
          src={room.imageUrl}
          alt={room.nameEn}
          fill
          sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] font-semibold bg-white/95 text-ink px-2.5 py-1 rounded-full">
          <span className="w-1 h-1 rounded-full bg-brand" />
          {room.capacity} {room.capacity === 1 ? "Guest" : "Guests"}
        </span>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="display-serif text-xl font-bold text-ink leading-tight">
              {room.nameEn}
            </h3>
            <p className="text-sm text-ink-muted mt-0.5" dir="rtl">{room.nameAr}</p>
          </div>
          <div className="text-right shrink-0">
            <div className="display-serif text-2xl font-bold text-brand leading-none">
              {room.priceSAR}
            </div>
            <div className="text-[10px] tracking-wider uppercase text-ink-muted mt-1">
              SAR / night
            </div>
            <div className="text-[10px] text-ink-muted" dir="rtl">ريال / ليلة</div>
          </div>
        </div>

        <p className="mt-4 text-sm text-ink-muted leading-relaxed">{room.descEn}</p>
        <p className="text-sm text-ink-muted leading-relaxed" dir="rtl">{room.descAr}</p>

        <Link
          href={{ pathname: "/book", query: { roomId: room.id } }}
          className="mt-5 block w-full text-center bg-ink text-white font-medium py-2.5 rounded-xl hover:bg-brand active:scale-[0.99] transition"
        >
          Reserve · احجز
        </Link>
      </div>
    </article>
  );
}
