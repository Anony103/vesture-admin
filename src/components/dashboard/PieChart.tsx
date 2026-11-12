import { ReactElement, useState } from "react";
import { GroupData } from "../../types";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface Props {
  data: GroupData[];
  /** one colour per slice, in the same order as data (any CSS colour, e.g. "var(--brand)") */
  colors: string[];
}

/** A donut: hover a slice, or its row in the legend, and the middle names it. */
function PieChartComp({ data, colors }: Props): ReactElement {
  const [hovered, setHovered] = useState<number | null>(null);
  const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
  const largest = data.reduce((best, item) => ((item.value || 0) > (best?.value || 0) ? item : best), data[0]);
  const focus = hovered !== null ? data[hovered] : largest;
  const share = total > 0 ? ((focus?.value || 0) / total) * 100 : 0;

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
      <div className="relative h-[200px] w-[200px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius="68%"
              outerRadius="94%"
              paddingAngle={3}
              cornerRadius={6}
              startAngle={90}
              endAngle={-270}
              stroke="none"
              animationDuration={900}
              onMouseEnter={(_, index) => setHovered(index)}
              onMouseLeave={() => setHovered(null)}
            >
              {data.map((entry, index) => (
                <Cell
                  key={entry.id}
                  fill={colors[index % colors.length]}
                  opacity={hovered === null || hovered === index ? 1 : 0.35}
                  style={{ transition: "opacity .2s ease", outline: "none" }}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="v-mono font-display text-3xl font-semibold leading-none">{share.toFixed(0)}%</span>
          <span className="v-eyebrow mt-1.5 max-w-[96px] truncate">{focus?.name}</span>
        </div>
      </div>

      <ul className="w-full min-w-0 flex-1 space-y-3">
        {data.map((item, index) => {
          const pct = total > 0 ? ((item.value || 0) / total) * 100 : 0;
          return (
            <li
              key={item.id}
              onMouseEnter={() => setHovered(index)}
              onMouseLeave={() => setHovered(null)}
              className="cursor-default"
            >
              <div className="flex items-center justify-between gap-2 text-[13px]">
                <span className="flex min-w-0 items-center gap-2 text-fg2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: colors[index % colors.length] }} />
                  <span className="truncate">{item.name}</span>
                </span>
                <span className="v-mono text-fg">{pct.toFixed(0)}%</span>
              </div>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-line">
                <div
                  className="h-full rounded-full transition-[width] duration-700 ease-out"
                  style={{ width: `${pct}%`, background: colors[index % colors.length] }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default PieChartComp;
