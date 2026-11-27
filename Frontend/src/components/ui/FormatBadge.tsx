import type { ScreeningFormat } from "@/types/domain";

const FORMAT_PIP: Record<ScreeningFormat, string> = {
  "IMAX with Laser": "bg-[#06B6D4] shadow-[0_0_8px_#06B6D4]",
  "Dolby Cinema": "bg-[#A78BFA] shadow-[0_0_8px_#A78BFA]",
  "70mm Film": "bg-[#F59E0B] shadow-[0_0_8px_#F59E0B]",
  "ScreenX 270°": "bg-[#4CD7F6] shadow-[0_0_8px_#4CD7F6]",
  "Standard 2D": "bg-[#94A3B8]",
};

export function FormatBadge({ format }: { format: ScreeningFormat }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-[4px] border border-white/10 bg-[#13151B] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#E3E2E8]">
      <span className={`h-1.5 w-1.5 rounded-full ${FORMAT_PIP[format]}`} aria-hidden="true" />
      {format}
    </span>
  );
}
