import type { ReactNode } from "react";

export type StatTone = "brand" | "mint" | "sky" | "gold" | "danger" | "neutral";

const TONES: Record<StatTone, string> = {
  brand: "var(--brand-rgb)",
  mint: "var(--mint-rgb)",
  sky: "var(--sky-rgb)",
  gold: "var(--gold-rgb)",
  danger: "var(--danger-rgb)",
  neutral: "var(--fg3-rgb)",
};

type Props = {
  label: string;
  value: ReactNode;
  /** a small line under the figure */
  hint?: ReactNode;
  tone?: StatTone;
  /** an icon shown in the corner */
  icon?: ReactNode;
  className?: string;
};

/** A summary figure: a small label, a large number, and a coloured edge to say what kind of figure it is. */
export const StatCard = ({ label, value, hint, tone = "brand", icon, className = "" }: Props) => (
  <div
    style={{ "--accent": TONES[tone] } as React.CSSProperties}
    className={`v-stat ${className}`}
  >
    <div className="flex items-start justify-between gap-2">
      <p className="v-eyebrow">{label}</p>
      {icon && <span className="text-[rgb(var(--accent))] opacity-90">{icon}</span>}
    </div>
    <p className="v-mono mt-2 break-words font-display text-xl font-semibold leading-tight sm:text-2xl">{value}</p>
    {hint && <p className="mt-1 text-xs text-fg3">{hint}</p>}
  </div>
);

/** A responsive row of StatCards. */
export const StatGrid = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div className={`grid grid-cols-2 gap-3 lg:grid-cols-4 ${className}`}>{children}</div>
);
