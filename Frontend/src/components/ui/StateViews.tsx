import { AlertTriangle, Film, Loader2 } from "lucide-react";

export function LoadingState({ label = "Loading CineView data..." }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center gap-3 rounded-lg border border-white/10 bg-[#13151B] px-6 py-14 text-center"
    >
      <Loader2 className="h-7 w-7 animate-spin text-[#A78BFA]" />
      <p className="text-sm text-[#94A3B8]">{label}</p>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-[#2A2E3D] bg-[#13151B] px-6 py-14 text-center">
      <Film className="h-8 w-8 text-[#A78BFA]/70" />
      <h3 className="font-display text-lg font-semibold text-white">{title}</h3>
      <p className="max-w-md text-sm text-[#94A3B8]">{description}</p>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-3 rounded-lg border border-[#FFB4AB]/30 bg-[#93000A]/20 px-6 py-12 text-center"
    >
      <AlertTriangle className="h-7 w-7 text-[#FFB4AB]" />
      <p className="text-sm text-[#FFDAD6]">{message}</p>
      {onRetry ? (
        <button
          onClick={onRetry}
          className="mt-1 rounded-[4px] border border-[#FFB4AB]/40 px-4 py-1.5 text-xs font-semibold text-white hover:bg-white/10"
        >
          Retry
        </button>
      ) : null}
    </div>
  );
}
