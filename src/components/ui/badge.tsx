import { cn } from "@/lib/utils";

type Variant = "default" | "success" | "warning" | "info" | "muted";

const styles: Record<Variant, string> = {
  default: "bg-slate-100 text-slate-700 ring-slate-200",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  warning: "bg-amber-50 text-amber-700 ring-amber-200",
  info: "bg-brand-50 text-brand-700 ring-brand-200",
  muted: "bg-slate-50 text-slate-600 ring-slate-200",
};

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        styles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
