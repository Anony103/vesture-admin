import { ReactNode, useLayoutEffect, useRef, useState } from "react";

export type TabDef = {
  value: string;
  label: ReactNode;
  /** a small number shown after the label (a count of rows, say); leave out to show none */
  count?: number;
  /** highlight the count (something is waiting for someone) */
  attention?: boolean;
};

type Props = {
  tabs: TabDef[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  /** names the group for screen readers */
  label?: string;
};

/** Tabs as a pill rail with a highlight that glides to the chosen one. */
export const Tabs = ({ tabs, value, onChange, className = "", label = "Sections" }: Props) => {
  const rail = useRef<HTMLDivElement>(null);
  const [mark, setMark] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  // measure the chosen tab so the highlight can sit under it (re-measured when the rail changes size)
  useLayoutEffect(() => {
    const el = rail.current;
    if (!el) return;
    const measure = () => {
      const active = el.querySelector<HTMLElement>('[aria-selected="true"]');
      setMark(active ? { x: active.offsetLeft, y: active.offsetTop, w: active.offsetWidth, h: active.offsetHeight } : null);
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [value, tabs]);

  return (
    <div
      ref={rail}
      role="tablist"
      aria-label={label}
      className={`v-tabs ${className}`}
    >
      {mark && (
        <span
          aria-hidden
          className="v-tabs-mark"
          style={{ width: mark.w, height: mark.h, transform: `translate(${mark.x}px, ${mark.y}px)` }}
        />
      )}
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          role="tab"
          aria-selected={tab.value === value}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={`v-tab-count ${tab.attention ? "v-tab-count-hot" : ""}`}>{tab.count}</span>
          )}
        </button>
      ))}
    </div>
  );
};
