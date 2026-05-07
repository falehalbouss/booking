"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Bath, BedDouble, Heart, Star, Users } from "lucide-react";
import type { Room } from "@/lib/types";

export default function RoomCard({ room }: { room: Room }) {
  const [saved, setSaved] = useState(false);

  return (
    <article className="card card-lift overflow-hidden flex flex-col h-full group">
      <Link
        href={{ pathname: "/book", query: { roomId: room.id } }}
        className="relative block aspect-[5/4] bg-sand overflow-hidden"
      >
        <Image
          src={room.imageUrl}
          alt={room.nameEn}
          fill
          sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
          className="object-cover img-zoom"
        />
        <div className="absolute inset-x-0 top-0 p-3 flex items-start justify-between">
          <span className="pill bg-white/95 text-ink shadow-soft">
            <Star className="w-3.5 h-3.5 fill-accent text-accent" />
            {room.rating.toFixed(1)}
            <span className="text-ink-muted font-medium">
              ({room.reviews})
            </span>
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setSaved((s) => !s);
            }}
            aria-label={saved ? "Unsave" : "Save"}
            className="w-9 h-9 rounded-full bg-white/95 text-ink hover:bg-white shadow-soft flex items-center justify-center transition active:scale-90"
          >
            <Heart
              className={`w-4 h-4 transition-all ${
                saved ? "fill-brand text-brand scale-110" : "text-ink-muted"
              }`}
            />
          </button>
        </div>
        <div className="absolute inset-x-3 bottom-3 flex flex-wrap gap-1.5">
          <span className="pill bg-white/90 text-ink text-[10px]">
            <BedDouble className="w-3 h-3" /> {room.beds} bed
          </span>
          <span className="pill bg-white/90 text-ink text-[10px]">
            <Bath className="w-3 h-3" /> {room.baths} bath
          </span>
          <span className="pill bg-white/90 text-ink text-[10px]">
            <Users className="w-3 h-3" /> {room.capacity}
          </span>
        </div>
      </Link>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="display-serif text-xl font-bold text-ink leading-tight">
              {room.nameEn}
            </h3>
            <p className="text-sm text-ink-muted mt-0.5" dir="rtl">
              {room.nameAr}
            </p>
          </div>
          <div className="text-right shrink-0">
            <div className="display-serif text-2xl font-bold text-brand leading-none">
              {room.priceSAR}
            </div>
            <div className="text-[10px] tracking-wider uppercase text-ink-muted mt-1.5">
              SAR / night
            </div>
          </div>
        </div>

        <p className="mt-3 text-sm text-ink-muted leading-relaxed line-clamp-2">
          {room.descEn}
        </p>

        <Link
          href={{ pathname: "/book", query: { roomId: room.id } }}
          className="mt-5 inline-flex items-center justify-between gap-2 w-full bg-ink text-white font-semibold py-3 px-4 rounded-2xl hover:bg-brand active:scale-[0.99] transition group/btn"
        >
          <span>Reserve · احجز</span>
          <ArrowUpRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
        </Link>
      </div>
    </article>
  );
}
