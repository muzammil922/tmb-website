'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import type { Banner } from '@/lib/shared';
import { SparklesIcon, PlayIcon, ChevronLeftIcon, ChevronRightIcon } from './icons';

interface PromoBannerSliderProps {
  banners?: Banner[];
}

export function PromoBannerSlider({ banners }: PromoBannerSliderProps) {
  const activeBanners = banners?.filter((b) => b.isActive) ?? [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const total = activeBanners.length;

  useEffect(() => {
    if (total <= 1 || isHovered) return;
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 6000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [total, isHovered]);

  if (total === 0) return null;

  const current = activeBanners[currentIndex];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  return (
    <section
      className="relative mb-12 px-6 md:px-12"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl border border-white/10 bg-[#0d0d14] shadow-2xl">
        {/* Banner Image Background */}
        <div className="relative h-[280px] w-full sm:h-[360px] md:h-[420px] lg:h-[460px]">
          <img
            src={current.imageUrl}
            alt={current.title}
            className="h-full w-full object-cover object-center transition-all duration-700 ease-out"
            key={current.id}
          />

          {/* Cinematic Overlay Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#08080c] via-[#08080c]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#08080c] via-[#08080c]/80 to-transparent md:w-2/3" />

          {/* Content Overlay */}
          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 md:p-14">
            <div className="max-w-2xl">
              {/* Badge */}
              <div className="mb-3 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-600/30 px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-300 backdrop-blur-md">
                  <SparklesIcon size={12} className="text-red-400" />
                  <span>Featured Premiere</span>
                </span>
                {total > 1 && (
                  <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-300 backdrop-blur-md">
                    {currentIndex + 1} of {total}
                  </span>
                )}
              </div>

              {/* Title */}
              <h2 className="mb-2 text-2xl font-black tracking-tight text-white drop-shadow-md sm:text-4xl md:text-5xl">
                {current.title}
              </h2>

              {/* Subtitle */}
              {current.subtitle && (
                <p className="mb-6 max-w-xl text-xs sm:text-sm md:text-base leading-relaxed text-zinc-300 line-clamp-2 sm:line-clamp-3">
                  {current.subtitle}
                </p>
              )}

              {/* Action Button */}
              <div className="flex items-center gap-3">
                <Link
                  href={current.buttonUrl || '/movies'}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-xl shadow-red-600/40 transition duration-200 hover:scale-105 hover:bg-red-700 hover:shadow-red-600/60"
                >
                  <PlayIcon size={16} />
                  <span>{current.buttonText || 'Watch Now'}</span>
                </Link>
                {current.buttonUrl && (
                  <Link
                    href={current.buttonUrl}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-xs sm:text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
                  >
                    <span>More Info</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Navigation Arrows (if multiple banners) */}
        {total > 1 && (
          <>
            <button
              onClick={prevSlide}
              aria-label="Previous Banner"
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-black/60 p-2.5 text-white backdrop-blur-md transition hover:bg-red-600 hover:border-red-600 md:left-6"
            >
              <ChevronLeftIcon size={18} />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next Banner"
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-black/60 p-2.5 text-white backdrop-blur-md transition hover:bg-red-600 hover:border-red-600 md:right-6"
            >
              <ChevronRightIcon size={18} />
            </button>

            {/* Pagination Dots */}
            <div className="absolute bottom-4 right-6 hidden items-center gap-1.5 sm:flex">
              {activeBanners.map((b, idx) => (
                <button
                  key={b.id}
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentIndex
                      ? 'w-8 bg-red-600 shadow-md shadow-red-600/50'
                      : 'w-2 bg-white/30 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
