"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { heroSlides } from "@/lib/rooms";

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {heroSlides.map((slide, i) => (
        <div
          key={slide.url}
          className={`absolute inset-0 transition-opacity duration-[1500ms] ease-out ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden={i !== index}
        >
          <div className={i === index ? "absolute inset-0 animate-kenburns" : "absolute inset-0"}>
            <Image
              src={slide.url}
              alt=""
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover"
            />
          </div>
        </div>
      ))}
      <div className="absolute inset-0 gradient-overlay" />
      <div className="absolute bottom-6 right-6 sm:right-10 flex items-center gap-2 z-10">
        {heroSlides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === index ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="absolute inset-x-0 top-1/3 sm:top-1/3 z-10 px-5 sm:px-10 lg:px-16"
        >
          <div className="max-w-3xl">
            <span className="eyebrow text-white/85">{heroSlides[index].eyebrow}</span>
            <h1 className="display-serif mt-3 text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.02] text-balance">
              {heroSlides[index].title}
            </h1>
            <p
              className="display-serif mt-3 text-2xl sm:text-3xl text-white/90 font-semibold"
              dir="rtl"
            >
              {heroSlides[index].titleAr}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
