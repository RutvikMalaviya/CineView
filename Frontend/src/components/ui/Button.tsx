import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "vip" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--cv-primary,#A78BFA)] text-[var(--cv-on-primary,#0B0C10)] font-semibold hover:opacity-90 hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(167,139,250,0.45)]",
  vip: "bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-[#0B0C10] font-semibold hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:-translate-y-0.5",
  ghost:
    "bg-transparent border border-current/20 text-[var(--cv-text,#FFFFFF)] hover:bg-[var(--cv-primary,#A78BFA)]/12 hover:border-[var(--cv-primary,#A78BFA)]/60",
  danger:
    "bg-[#93000A]/85 text-[#FFDAD6] border border-[#FFB4AB]/30 hover:bg-[#93000A]",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-[4px] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A78BFA] disabled:opacity-45 disabled:pointer-events-none cursor-pointer ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
