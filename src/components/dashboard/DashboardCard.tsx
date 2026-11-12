import { ReactElement } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { useCountUp } from "@/hooks/use-count-up";

interface Props {
  title: string;
  /** the figure as the server sent it */
  amount?: string | number;
  icon: LucideIcon;
  loading: boolean;
  /** "r g b" triplet that tints the card, e.g. "164 92 255" */
  accent: string;
  /** where clicking the card goes */
  to: string;
  /** milliseconds to wait before the card fades in */
  delay?: number;
}

const toNumber = (value: Props["amount"]): number | null => {
  if (value === undefined || value === null || value === "") return null;
  const n = typeof value === "number" ? value : Number(String(value).replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
};

function DashboardCard({ title, amount, icon: Icon, loading, accent, to, delay = 0 }: Props): ReactElement {
  const target = toNumber(amount);
  const shown = useCountUp(loading ? null : target);

  return (
    <Link
      to={to}
      aria-label={`${title}: open`}
      style={{ "--accent": accent, animationDelay: `${delay}ms` } as React.CSSProperties}
      className="glass v-kpi v-rise group flex flex-col justify-between gap-6 p-5"
    >
      <div className="flex items-start justify-between">
        <span
          className="grid h-11 w-11 place-items-center rounded-xl border"
          style={{
            color: "rgb(var(--accent))",
            background: "rgb(var(--accent) / 0.14)",
            borderColor: "rgb(var(--accent) / 0.3)",
          }}
        >
          <Icon size={20} strokeWidth={1.9} />
        </span>
        <ArrowUpRight
          size={16}
          className="text-fg3 opacity-0 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg group-hover:opacity-100"
          aria-hidden
        />
      </div>

      <div>
        {loading ? (
          <div className="v-skeleton h-9 w-24" />
        ) : (
          <p className="v-mono font-display text-[2rem] font-semibold leading-none tracking-tight">
            {target === null ? (amount ?? "—") : Math.round(shown).toLocaleString()}
          </p>
        )}
        <p className="v-eyebrow mt-2">{title}</p>
      </div>
    </Link>
  );
}

export default DashboardCard;
