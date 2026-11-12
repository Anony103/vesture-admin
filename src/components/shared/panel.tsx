import type { ReactNode } from "react";

type Props = {
  title: string;
  /** a small line under the title */
  subtitle?: string;
  /** controls shown on the right of the title row */
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  /** milliseconds to wait before the fade-up, to stagger several panels */
  delay?: number;
};

/** A titled glass card: the building block of the redesigned pages. */
export const Panel = ({ title, subtitle, action, children, className = "", delay = 0 }: Props) => (
  <section className={`glass v-rise flex flex-col p-5 ${className}`} style={{ animationDelay: `${delay}ms` }}>
    <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="font-display text-base font-semibold leading-tight">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-fg3">{subtitle}</p>}
      </div>
      {action}
    </header>
    {children}
  </section>
);
