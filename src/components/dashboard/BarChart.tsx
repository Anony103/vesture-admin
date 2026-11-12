import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface Props {
  data?: { month: string; totalAmount: number }[];
}

const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });

/** Oldest month first, when every label is a month name; otherwise the order the server gave. */
const sortByMonth = (rows: { month: string; totalAmount: number }[]) => {
  const index = (name: string) => MONTHS.indexOf(String(name).trim().toLowerCase());
  return rows.every((row) => index(row.month) >= 0) ? [...rows].sort((a, b) => index(a.month) - index(b.month)) : rows;
};

type TipProps = { active?: boolean; payload?: { value: number; payload: { name: string } }[] };

const Tip = ({ active, payload }: TipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-line-hi bg-surface px-3 py-2 shadow-xl">
      <p className="v-eyebrow">{payload[0].payload.name}</p>
      <p className="v-mono mt-0.5 text-sm font-semibold">₦{Number(payload[0].value).toLocaleString()}</p>
    </div>
  );
};

/** Monthly transaction volume as gradient bars. */
export default function BarChartComponent({ data }: Props) {
  const rows = sortByMonth(data ?? []).map((item) => ({ name: item.month, amount: item.totalAmount }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={rows} margin={{ top: 8, right: 8, left: -8, bottom: 0 }} barCategoryGap="22%">
        <defs>
          <linearGradient id="vTxFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" style={{ stopColor: "var(--brand)", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "var(--brand)", stopOpacity: 0.25 }} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--line)" strokeDasharray="4 6" />
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "var(--fg-3)", fontSize: 11 }}
          tickFormatter={(value: string) => String(value).slice(0, 3)}
          dy={6}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          width={52}
          tick={{ fill: "var(--fg-3)", fontSize: 11 }}
          tickFormatter={(value: number) => `₦${compact.format(value)}`}
        />
        <Tooltip content={<Tip />} cursor={{ fill: "var(--panel-hi)", radius: 10 }} />
        <Bar dataKey="amount" fill="url(#vTxFill)" radius={[10, 10, 3, 3]} maxBarSize={48} animationDuration={1000} />
      </BarChart>
    </ResponsiveContainer>
  );
}
