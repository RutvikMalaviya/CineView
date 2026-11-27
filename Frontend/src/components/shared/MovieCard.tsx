"use client";

import { Clock, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { FormatBadge } from "@/components/ui/FormatBadge";
import type { Movie } from "@/types/domain";

export function MovieCard({ movie }: { movie: Movie }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="glass-card group relative flex flex-col overflow-hidden rounded-xl"
    >
      <Link
        href={`/movies/${movie.id}`}
        className="relative aspect-[2/3] w-full overflow-hidden bg-[#0D0E12]"
      >
        <Image
          src={movie.posterUrl}
          alt={`${movie.title} poster`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B0C10] via-[#0B0C10]/20 to-transparent" />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="rounded-[4px] border border-white/20 bg-[#0B0C10]/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-md">
            {movie.rating}
          </span>
          {movie.status === "coming_soon" ? (
            <span className="inline-flex items-center gap-1 rounded-[4px] border border-[#F59E0B]/40 bg-[#F59E0B]/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#FFB95F] backdrop-blur-md">
              <Sparkles className="h-2.5 w-2.5" /> Coming Soon
            </span>
          ) : null}
        </div>
      </Link>

      <div className="flex flex-1 flex-col justify-between gap-3 p-4">
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {movie.formats.slice(0, 2).map((fmt) => (
              <FormatBadge key={fmt} format={fmt} />
            ))}
          </div>
          <Link href={`/movies/${movie.id}`} className="block">
            <h3 className="font-display text-lg font-bold text-white transition-colors group-hover:text-[#CEBDFF]">
              {movie.title}
            </h3>
          </Link>
          <p className="line-clamp-2 text-xs text-[#94A3B8]">{movie.tagline}</p>
        </div>

        <div className="flex items-center justify-between border-t border-white/10 pt-3 text-xs text-[#94A3B8]">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-[#A78BFA]" />
            {Math.floor(movie.durationMinutes / 60)}h {movie.durationMinutes % 60}m
          </span>
          <Link
            href={`/movies/${movie.id}`}
            className="font-semibold text-[#A78BFA] transition-transform group-hover:translate-x-0.5 group-hover:text-[#CEBDFF]"
          >
            Book Seats →
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
