"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarCheck,
  ChevronDown,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import Header from "@/components/Header";
import RoomCard from "@/components/RoomCard";
import { rooms } from "@/lib/rooms";

type SortKey = "popular" | "price-asc" | "price-desc" | "rating";

const SORT_OPTIONS: { key: SortKey; label: string; labelAr: string }[] = [
  { key: "popular", label: "Popular", labelAr: "الأكثر شعبية" },
  { key: "price-asc", label: "Price: Low → High", labelAr: "السعر: من الأقل" },
  { key: "price-desc", label: "Price: High → Low", labelAr: "السعر: من الأعلى" },
  { key: "rating", label: "Top rated", labelAr: "الأعلى تقييماً" },
];

export default function RoomsPage() {
  const [query, setQuery] = useState("");
  const [guests, setGuests] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [sort, setSort] = useState<SortKey>("popular");
  const [sortOpen, setSortOpen] = useState(false);

  const filtered = useMemo(() => {
    let r = rooms.slice();
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      r = r.filter(
        (room) =>
          room.nameEn.toLowerCase().includes(q) ||
          room.nameAr.includes(q) ||
          room.descEn.toLowerCase().includes(q)
      );
    }
    if (typeof guests === "number") {
      r = r.filter((room) => room.capacity >= guests);
    }
    if (typeof maxPrice === "number") {
      r = r.filter((room) => room.priceKWD <= maxPrice);
    }
    switch (sort) {
      case "price-asc":
        r.sort((a, b) => a.priceKWD - b.priceKWD);
        break;
      case "price-desc":
        r.sort((a, b) => b.priceKWD - a.priceKWD);
        break;
      case "rating":
        r.sort((a, b) => b.rating - a.rating);
        break;
    }
    return r;
  }, [query, guests, maxPrice, sort]);

  return (
    <div className="min-h-dvh flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container-page pt-6 pb-16">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Home · الرئيسية
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-4 max-w-2xl"
          >
            <span className="eyebrow text-brand">
              <span className="w-6 h-px bg-brand" /> Stay · غرفنا
            </span>
            <h1 className="display-serif mt-3 text-4xl sm:text-6xl font-extrabold text-ink leading-[1.02]">
              Our rooms
            </h1>
            <p
              className="display-serif text-2xl sm:text-3xl text-ink-muted mt-1"
              dir="rtl"
            >
              غرفنا
            </p>
            <p className="mt-4 text-base text-ink-muted leading-relaxed">
              Pick the room that fits your stay, then continue to booking.
            </p>
            <p
              className="text-base text-ink-muted leading-relaxed"
              dir="rtl"
            >
              اختر الغرفة المناسبة لإقامتك ثم تابع للحجز.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-8 card p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3"
          >
            <div className="sm:col-span-5 flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-sand-light">
              <Search className="w-4 h-4 text-ink-muted shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search rooms · ابحث عن غرفة"
                className="bg-transparent w-full outline-none text-sm font-medium text-ink placeholder:text-ink-soft"
              />
            </div>
            <div className="sm:col-span-3 flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-sand-light">
              <CalendarCheck className="w-4 h-4 text-ink-muted shrink-0" />
              <input
                type="date"
                className="bg-transparent w-full outline-none text-sm font-medium text-ink"
                aria-label="Check-in"
              />
            </div>
            <div className="sm:col-span-3 flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-sand-light">
              <CalendarCheck className="w-4 h-4 text-ink-muted shrink-0" />
              <input
                type="date"
                className="bg-transparent w-full outline-none text-sm font-medium text-ink"
                aria-label="Check-out"
              />
            </div>
            <button type="button" className="btn-primary justify-center sm:col-span-1 px-4 sm:px-3">
              <Sparkles className="w-4 h-4" />
              <span className="sm:hidden">Search</span>
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-5 flex flex-wrap items-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4 text-ink-muted ml-1 mr-1" />
            <FilterChip
              label={`Guests${guests ? `: ${guests}+` : ""}`}
              active={guests !== ""}
              onClick={() => setGuests(guests === "" ? 2 : guests === 2 ? 4 : "")}
            />
            <FilterChip
              label={
                maxPrice === ""
                  ? "Any price"
                  : `≤ ${maxPrice} KWD`
              }
              active={maxPrice !== ""}
              onClick={() =>
                setMaxPrice(
                  maxPrice === ""
                    ? 40
                    : maxPrice === 40
                    ? 80
                    : ""
                )
              }
            />

            <div className="relative ml-auto">
              <button
                type="button"
                onClick={() => setSortOpen((v) => !v)}
                className="pill-light"
              >
                Sort: {SORT_OPTIONS.find((s) => s.key === sort)?.label}
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {sortOpen && (
                <div className="absolute right-0 mt-2 w-64 card p-1.5 z-10 animate-fade-up">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => {
                        setSort(opt.key);
                        setSortOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm transition flex items-center justify-between ${
                        sort === opt.key
                          ? "bg-brand text-white font-semibold"
                          : "hover:bg-sand-light text-ink"
                      }`}
                    >
                      <span>{opt.label}</span>
                      <span
                        className={`text-[10px] ${
                          sort === opt.key ? "text-white/85" : "text-ink-muted"
                        }`}
                        dir="rtl"
                      >
                        {opt.labelAr}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          <div className="mt-3 text-xs text-ink-muted">
            {filtered.length} {filtered.length === 1 ? "room" : "rooms"}{" "}
            available · <span dir="rtl">{filtered.length} غرفة متاحة</span>
          </div>

          {filtered.length === 0 ? (
            <div className="mt-10 card p-10 text-center text-sm text-ink-muted">
              No rooms match your filters · لا توجد غرف مطابقة
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((room, i) => (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: i * 0.07 }}
                >
                  <RoomCard room={room} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`pill ${
        active
          ? "bg-brand text-white"
          : "bg-white text-ink border border-black/5 hover:bg-sand-light"
      }`}
    >
      {label}
    </button>
  );
}
